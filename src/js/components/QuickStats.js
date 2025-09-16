/**
 * QuickStats - renders a row of stat cards
 * @param {Array} stats - Array of stat objects like:
 *   { title, value, id, bgClass, textClass, icon }
 *
 * icon should be a Bootstrap Icon class, e.g. "bi-box-seam"
 *
 * bgClass should be a valid Bootstrap 5 background utility class, e.g.
 *   "bg-primary", "bg-success", "bg-danger", "bg-warning", "bg-info", "bg-secondary", "bg-dark", "bg-light"
 */
export default function QuickStats(stats = []) {
  const row = document.createElement("div");
  row.className = "row mb-4";

  stats.forEach(({ title, value, id, bgClass, textClass, icon }) => {
    const col = document.createElement("div");
    col.className = "col-lg-3 col-sm-6 mb-3";

    const card = document.createElement("div");
    card.className = `card ${bgClass} ${textClass}`;

    const body = document.createElement("div");
    body.className = "card-body";

    const wrapper = document.createElement("div");
    wrapper.className = "d-flex justify-content-between";

    const left = document.createElement("div");

    const h6 = document.createElement("h6");
    h6.className = "card-title";
    h6.textContent = title;

    const h3 = document.createElement("h3");
    h3.className = "mb-0";
    h3.id = id;
    h3.textContent = value;

    left.appendChild(h6);
    left.appendChild(h3);

    const right = document.createElement("div");
    right.className = "align-self-center";

    const iconEl = document.createElement("i");
    iconEl.className = `bi ${icon} fs-2 opacity-75`; // Bootstrap Icons
    right.appendChild(iconEl);

    wrapper.appendChild(left);
    wrapper.appendChild(right);
    body.appendChild(wrapper);
    card.appendChild(body);
    col.appendChild(card);
    row.appendChild(col);
  });

  return row;
}
