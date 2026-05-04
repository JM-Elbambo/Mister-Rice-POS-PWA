import BasePage from "../components/BasePage.js";
import { dataStore } from "../store/index.js";
import { formatDateTime } from "../utils.js";

export default function DashboardPage() {
  return new Dashboard().getElement();
}

class Dashboard extends BasePage {
  constructor() {
    super();
    this.container.className = "container";
    this.charts = {};
    this.init();
  }

  async init() {
    try {
      await this.initCollections([
        {
          collection: dataStore.transactions,
          callback: (data, loading, error) => {
            if (error) return this.showError(error);
            if (!loading && this.initialized) this.update();
          },
        },
        {
          collection: dataStore.items,
          callback: (_, loading, error) => {
            if (error) return this.showError(error);
            if (!loading && this.initialized) this.update();
          },
        },
        {
          collection: dataStore.stockBatches,
          callback: (_, loading) => {
            if (!loading && this.initialized) this.update();
          },
        },
      ]);
      this.update();
    } catch {}
  }

  update() {
    if (!this.initialized) return;
    this.render();
  }

  // ── Data helpers ──────────────────────────────────────────────

  detectLimit() {
    const txList = dataStore.transactions.data;
    const LIMIT = 1000;

    if (txList.length < LIMIT) return { limitHit: false, safeDays: 30, cutoffDate: null };

    const oldest = txList[txList.length - 1];
    const oldestDate = oldest?.createdAt?.slice(0, 10);
    if (!oldestDate) return { limitHit: false, safeDays: 30, cutoffDate: null };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const oldestDay = new Date(oldestDate + "T00:00:00");
    const safeDays = Math.round((today - oldestDay) / 86400000);

    return { limitHit: true, safeDays, cutoffDate: oldestDate };
  }

  // O(n) single pass
  buildDailyMap(txList) {
    const map = new Map();
    for (const tx of txList) {
      const key = tx.createdAt.slice(0, 10);
      const cur = map.get(key) ?? { revenue: 0, count: 0, units: 0 };
      cur.revenue += tx.total || 0;
      cur.count += 1;
      cur.units += tx.unitCount || 0;
      map.set(key, cur);
    }
    return map;
  }

  // O(days) — no inner scan
  getRevenueByDay(days, dailyMap) {
    const result = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-CA");
      const label = d.toLocaleDateString("en-CA", { month: "short", day: "numeric" });
      result.push({ label, key, ...(dailyMap.get(key) ?? { revenue: 0, count: 0, units: 0 }) });
    }
    return result;
  }

  filterByDays(txList, days) {
    const since = new Date();
    since.setDate(since.getDate() - days);
    since.setHours(0, 0, 0, 0);
    return txList.filter((tx) => new Date(tx.createdAt) >= since);
  }

  getTopProducts(txList, n = 5) {
    const map = new Map();
    for (const tx of txList) {
      for (const item of tx.items || []) {
        const cur = map.get(item.name) ?? { units: 0, revenue: 0 };
        map.set(item.name, {
          units: cur.units + item.qty,
          revenue: cur.revenue + item.subtotal,
        });
      }
    }
    return [...map.entries()]
      .map(([name, v]) => ({ name, ...v }))
      .sort((a, b) => b.units - a.units)
      .slice(0, n);
  }

  getLowStockItems() {
    return dataStore.items.data
      .map((item) => ({
        ...item,
        totalStock: dataStore.stockBatches.getItemTotal(item.id),
      }))
      .filter((item) => item.totalStock <= item.minStock)
      .sort((a, b) => a.totalStock - b.totalStock);
  }

  // ── Render ────────────────────────────────────────────────────

  render() {
    this.destroyCharts();

    const allTx = dataStore.transactions.data;
    const { limitHit, safeDays, cutoffDate } = this.detectLimit();

    const dailyMap = this.buildDailyMap(allTx);
    const chartDays = Math.min(safeDays, 30);
    const revenueByDay = this.getRevenueByDay(chartDays, dailyMap);

    const safeTx = limitHit ? this.filterByDays(allTx, safeDays) : allTx;
    const todayKey = new Date().toLocaleDateString("en-CA");
    const todayData = dailyMap.get(todayKey) ?? { revenue: 0, count: 0, units: 0 };
    const weekTx = this.filterByDays(safeTx, Math.min(7, safeDays));
    const weekRevenue = weekTx.reduce((s, t) => s + (t.total || 0), 0);
    const monthRevenue = safeTx.reduce((s, t) => s + (t.total || 0), 0);
    const totalTxCount = safeTx.length;
    const avgOrder = totalTxCount ? monthRevenue / totalTxCount : 0;

    const topProducts = this.getTopProducts(weekTx);
    const lowStock = this.getLowStockItems();
    const outOfStock = lowStock.filter((i) => i.totalStock === 0).length;
    const lowOnly = lowStock.filter((i) => i.totalStock > 0).length;
    const totalAlerts = lowStock.length;
    const recentTx = allTx.slice(0, 5);

    this.container.innerHTML = `
      ${limitHit ? `
        <div class="alert alert-warning d-flex align-items-start gap-2 py-2 mb-3">
          <i class="bi bi-exclamation-triangle-fill flex-shrink-0 mt-1"></i>
          <div class="small">
            <strong>Transaction limit reached (1,000 records).</strong>
            Data before <strong>${cutoffDate}</strong> is incomplete and has been excluded.
            Metrics and charts reflect complete days only.
          </div>
        </div>
      ` : ""}

      <!-- Stats -->
      <div class="row g-3 mb-4">
        ${this.statCard("Today's Revenue", `₱${todayData.revenue.toFixed(2)}`, "bi-cash-stack", "bg-primary text-white", `${todayData.count} transaction${todayData.count !== 1 ? "s" : ""}`)}
        ${this.statCard("This Week", `₱${weekRevenue.toFixed(2)}`, "bi-graph-up-arrow", "bg-success text-white", `${weekTx.length} transactions`)}
        ${this.statCard(`Last ${chartDays} Days`, `₱${monthRevenue.toFixed(2)}`, "bi-calendar-month", "bg-info text-white", `${totalTxCount} transactions`)}
        ${this.statCard("Avg. Order Value", `₱${avgOrder.toFixed(2)}`, "bi-receipt", "bg-warning text-dark", `over ${chartDays} days`)}
      </div>

      <!-- Charts -->
      <div class="row g-3 mb-4">
        <div class="col-lg-8">
          <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="mb-0">
                <i class="bi bi-bar-chart-line me-2"></i>Daily Revenue
                <span class="text-muted fw-normal small ms-1">— last ${chartDays} days</span>
              </h6>
              <small class="text-muted">${totalTxCount} transactions</small>
            </div>
            <div class="card-body">
              <canvas id="revenueChart"></canvas>
            </div>
          </div>
        </div>
        <div class="col-lg-4">
          <div class="card h-100">
            <div class="card-header">
              <h6 class="mb-0">
                <i class="bi bi-trophy me-2"></i>Top Products
                <span class="text-muted fw-normal small ms-1">— this week</span>
              </h6>
            </div>
            <div class="card-body d-flex align-items-center">
              <canvas id="topChart" class="w-100"></canvas>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom -->
      <div class="row g-3 mb-4">
        <div class="col-lg-7">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="mb-0"><i class="bi bi-clock-history me-2"></i>Recent Transactions</h6>
              <a href="#/transactions" class="btn btn-sm btn-outline-secondary">View All</a>
            </div>
            <div class="card-body p-0">
              ${recentTx.length ? `
                <div class="table-responsive">
                  <table class="table table-sm table-hover mb-0">
                    <thead class="table-light">
                      <tr>
                        <th>Date & Time</th>
                        <th>Items</th>
                        <th class="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${recentTx.map((tx) => {
                        const first = tx.items?.[0]?.name ?? "—";
                        const extra = (tx.itemCount ?? tx.items?.length ?? 1) - 1;
                        return `<tr>
                          <td class="text-muted small text-nowrap">${formatDateTime(tx.createdAt)}</td>
                          <td>${first}${extra > 0 ? ` <span class="badge bg-secondary">+${extra} more</span>` : ""}</td>
                          <td class="text-end fw-semibold text-nowrap">₱${(tx.total || 0).toFixed(2)}</td>
                        </tr>`;
                      }).join("")}
                    </tbody>
                  </table>
                </div>
              ` : `<p class="text-muted text-center py-4 mb-0">No transactions yet</p>`}
            </div>
          </div>
        </div>

        <div class="col-lg-5">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="mb-0">
                <i class="bi bi-exclamation-triangle text-warning me-2"></i>Stock Alerts
              </h6>
              <a href="#/inventory" class="btn btn-sm btn-outline-secondary">View in Inventory</a>
            </div>
            <div class="card-body">
              ${totalAlerts === 0 ? `
                <div class="d-flex align-items-center gap-2 text-success">
                  <i class="bi bi-check-circle-fill fs-5"></i>
                  <span>All items sufficiently stocked</span>
                </div>
              ` : `
                <div class="d-flex flex-column gap-2">
                  ${outOfStock > 0 ? `
                    <div class="d-flex justify-content-between align-items-center p-3 bg-danger bg-opacity-10 rounded">
                      <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-x-circle-fill text-danger fs-5"></i>
                        <div>
                          <div class="fw-semibold">Out of Stock</div>
                          <div class="small text-muted">Immediate restocking needed</div>
                        </div>
                      </div>
                      <span class="badge bg-danger fs-6">${outOfStock}</span>
                    </div>
                  ` : ""}
                  ${lowOnly > 0 ? `
                    <div class="d-flex justify-content-between align-items-center p-3 bg-warning bg-opacity-10 rounded">
                      <div class="d-flex align-items-center gap-2">
                        <i class="bi bi-exclamation-triangle-fill text-warning fs-5"></i>
                        <div>
                          <div class="fw-semibold">Low Stock</div>
                          <div class="small text-muted">Below minimum threshold</div>
                        </div>
                      </div>
                      <span class="badge bg-warning text-dark fs-6">${lowOnly}</span>
                    </div>
                  ` : ""}
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;

    this.loadCharts(revenueByDay, topProducts);
  }

  statCard(title, value, icon, cls, sub = "") {
    return `
      <div class="col-6 col-lg-3">
        <div class="card ${cls}">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start">
              <div>
                <div class="small mb-1 opacity-75">${title}</div>
                <div class="h4 mb-0 fw-bold">${value}</div>
                ${sub ? `<div class="small opacity-75 mt-1">${sub}</div>` : ""}
              </div>
              <i class="bi ${icon} fs-2 opacity-50"></i>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // ── Charts ────────────────────────────────────────────────────

  loadCharts(revenueByDay, topProducts) {
    if (typeof Chart === "undefined") {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js";
      script.onload = () => this.drawCharts(revenueByDay, topProducts);
      document.head.appendChild(script);
    } else {
      this.drawCharts(revenueByDay, topProducts);
    }
  }

  drawCharts(revenueByDay, topProducts) {
    const isDark = document.documentElement.getAttribute("data-bs-theme") === "dark";
    const gridColor = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
    const textColor = isDark ? "#adb5bd" : "#6c757d";

    const revenueCtx = this.container.querySelector("#revenueChart");
    if (revenueCtx) {
      this.charts.revenue = new Chart(revenueCtx, {
        type: "bar",
        data: {
          labels: revenueByDay.map((d) => d.label),
          datasets: [{
            label: "Revenue",
            data: revenueByDay.map((d) => d.revenue),
            backgroundColor: "rgba(79,70,229,0.7)",
            borderColor: "rgba(79,70,229,1)",
            borderWidth: 1,
            borderRadius: 4,
          }],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { display: false },
            tooltip: {
              callbacks: { label: (ctx) => ` ₱${ctx.parsed.y.toFixed(2)}` },
            },
          },
          scales: {
            x: {
              grid: { color: gridColor },
              ticks: { color: textColor, maxTicksLimit: 10, maxRotation: 45 },
            },
            y: {
              grid: { color: gridColor },
              ticks: { color: textColor, callback: (v) => `₱${v}` },
              beginAtZero: true,
            },
          },
        },
      });
    }

    const topCtx = this.container.querySelector("#topChart");
    if (topCtx && topProducts.length) {
      this.charts.top = new Chart(topCtx, {
        type: "bar",
        data: {
          labels: topProducts.map((p) =>
            p.name.length > 16 ? p.name.slice(0, 14) + "…" : p.name,
          ),
          datasets: [{
            label: "Units Sold",
            data: topProducts.map((p) => p.units),
            backgroundColor: [
              "rgba(79,70,229,0.75)",
              "rgba(99,102,241,0.75)",
              "rgba(16,185,129,0.75)",
              "rgba(245,158,11,0.75)",
              "rgba(239,68,68,0.75)",
            ],
            borderRadius: 4,
          }],
        },
        options: {
          indexAxis: "y",
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: gridColor }, ticks: { color: textColor }, beginAtZero: true },
            y: { grid: { display: false }, ticks: { color: textColor } },
          },
        },
      });
    } else if (topCtx) {
      topCtx.closest(".card-body").innerHTML =
        '<p class="text-muted text-center py-4 mb-0">No sales data this week</p>';
    }
  }

  destroyCharts() {
    Object.values(this.charts).forEach((c) => c?.destroy());
    this.charts = {};
  }

  cleanup() {
    this.destroyCharts();
    super.cleanup();
  }
}