import BasePage from "../components/BasePage.js";
import { dataStore } from "../store/index.js";
import QuickStats from "../components/QuickStats.js";
import Table from "../components/Table.js";
import Pagination from "../components/Pagination.js";
import TableFilter from "../components/TableFilter.js";
import TransactionDetailModal from "../components/modals/TransactionDetail.js";

export default function TransactionsPage() {
  return new Transactions().getElement();
}

class Transactions extends BasePage {
  constructor() {
    super();
    this.container.className = "container";
    this.filteredData = [];
    this.filters = { search: "", filters: {}, sort: "newest" };
    this.page = 1;
    this.perPage = 15;

    this.statsEl = document.createElement("div");
    this.filtersEl = document.createElement("div");
    this.tableEl = document.createElement("div");
    this.paginationEl = document.createElement("div");
    this.paginationEl.className =
      "d-flex justify-content-between align-items-center mt-3 mb-4";

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
      ]);
      this.update();
    } catch {}
  }

  update() {
    if (!this.initialized) return;
    this.filteredData = this.applyFilters(
      dataStore.transactions.data,
      this.filters,
    );
    this.render();
  }

  render() {
    if (!this.container.contains(this.statsEl)) {
      this.container.innerHTML = "";
      this.container.append(
        this.statsEl,
        this.filtersEl,
        this.tableEl,
        this.paginationEl,
      );
    }
    this.renderStats();
    this.renderFilters();
    this.renderTable();
    this.renderPagination();
  }

  renderStats() {
    const { count, revenue, units, avgOrder } =
      dataStore.transactions.getSummary();

    this.statsEl.innerHTML = "";
    this.statsEl.appendChild(
      QuickStats([
        {
          title: "Transactions",
          value: count,
          bgClass: "bg-primary",
          textClass: "text-white",
          icon: "bi-receipt",
        },
        {
          title: "Revenue",
          value: `₱${revenue.toFixed(0)}`,
          bgClass: "bg-success",
          textClass: "text-white",
          icon: "bi-cash-stack",
        },
        {
          title: "Units Sold",
          value: units,
          bgClass: "bg-info",
          textClass: "text-white",
          icon: "bi-bag-check",
        },
        {
          title: "Avg. Order",
          value: `₱${avgOrder.toFixed(0)}`,
          bgClass: "bg-warning",
          textClass: "text-dark",
          icon: "bi-graph-up",
        },
      ]),
    );
  }

  renderFilters() {
    this.filtersEl.innerHTML = "";
    this.filtersEl.appendChild(
      TableFilter({
        searchPlaceholder: "Search by product or transaction ID...",
        sortOptions: [
          { value: "newest", label: "Newest First" },
          { value: "oldest", label: "Oldest First" },
          { value: "total_desc", label: "Total (High-Low)" },
          { value: "total_asc", label: "Total (Low-High)" },
          { value: "items_desc", label: "Most Items" },
        ],
        onFilter: (f) => {
          this.filters = f;
          this.page = 1;
          this.update();
        },
        initialValues: this.filters,
      }),
    );
  }

  renderTable() {
    const start = (this.page - 1) * this.perPage;
    const pageData = this.filteredData.slice(start, start + this.perPage);

    const rows = pageData.map((tx) => [
      new Date(tx.createdAt).toLocaleString("en-PH", {
        dateStyle: "short",
        timeStyle: "short",
      }),
      tx.itemCount ?? tx.items?.length ?? 0,
      tx.unitCount ?? 0,
      `₱${(tx.total || 0).toFixed(2)}`,
      tx.discount > 0 ? `-₱${(tx.discount || 0).toFixed(2)}` : "—",
    ]);

    const actions = [
      {
        label: "View Details",
        onClick: (_, i) => TransactionDetailModal.show(pageData[i]),
      },
    ];

    this.tableEl.innerHTML = "";
    const wrapper = document.createElement("div");
    wrapper.className = "table-responsive";
    wrapper.appendChild(
      Table(
        ["Date & Time", "Items", "Units", "Total", "Discount"],
        rows,
        actions,
      ),
    );
    this.tableEl.appendChild(wrapper);
  }

  renderPagination() {
    this.paginationEl.innerHTML = "";
    if (this.filteredData.length <= this.perPage) return;

    const start = (this.page - 1) * this.perPage + 1;
    const end = Math.min(start + this.perPage - 1, this.filteredData.length);

    const summary = document.createElement("div");
    summary.className = "text-muted small";
    summary.textContent = `${start}–${end} of ${this.filteredData.length}`;

    this.paginationEl.append(
      summary,
      Pagination({
        totalItems: this.filteredData.length,
        itemsPerPage: this.perPage,
        onPageChange: (p) => {
          this.page = p;
          this.renderTable();
        },
      }),
    );
  }

  applyFilters(data, { search, sort }) {
    let result = [...data];

    if (search) {
      const term = search.toLowerCase();
      result = result.filter(
        (tx) =>
          tx.id?.toLowerCase().includes(term) ||
          tx.items?.some((i) => i.name?.toLowerCase().includes(term)),
      );
    }

    const sortFns = {
      newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
      oldest: (a, b) => a.createdAt.localeCompare(b.createdAt),
      total_desc: (a, b) => (b.total || 0) - (a.total || 0),
      total_asc: (a, b) => (a.total || 0) - (b.total || 0),
      items_desc: (a, b) => (b.itemCount || 0) - (a.itemCount || 0),
    };

    if (sortFns[sort]) result.sort(sortFns[sort]);
    return result;
  }
}
