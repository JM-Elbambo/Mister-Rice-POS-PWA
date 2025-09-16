/**
 * Enhanced Table Component with conditional formatting
 * @param {Array} headers - array of column headers (strings)
 * @param {Array} rows - array of row data (each row = array of cells)
 * @param {Array} [actions] - optional array of action objects like:
 *   { label: string, onClick: function(row) }
 * @param {Object} [formatters] - optional column formatters:
 *   { columnIndex: function(value, rowData) => htmlString }
 */
export default function Table(
  headers = [],
  rows = [],
  actions = null,
  formatters = {}
) {
  const table = document.createElement("table");
  table.className = "table table-striped align-middle";

  // Add "Actions" header automatically if actions exist
  const effectiveHeaders = actions ? [...headers, "Actions"] : headers;

  // Table head
  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  effectiveHeaders.forEach((h, i) => {
    const th = document.createElement("th");
    th.textContent = h;

    // Right-align and minimize width for "Actions" column
    if (actions && i === effectiveHeaders.length - 1) {
      th.className = "text-end text-nowrap";
      th.style.width = "1%";
    }

    headRow.appendChild(th);
  });
  thead.appendChild(headRow);

  // Table body
  const tbody = document.createElement("tbody");
  rows.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");

    row.forEach((cell, cellIndex) => {
      const td = document.createElement("td");

      // Apply formatter if available
      if (formatters[cellIndex]) {
        td.innerHTML = formatters[cellIndex](cell, row);
      } else {
        td.textContent = cell;
      }

      tr.appendChild(td);
    });

    // Add actions dropdown if provided
    if (actions) {
      const td = document.createElement("td");
      td.className = "text-end text-nowrap";

      td.appendChild(createActionsDropdown(actions, row, rowIndex));
      tr.appendChild(td);
    }

    tbody.appendChild(tr);
  });

  table.appendChild(thead);
  table.appendChild(tbody);

  return table;
}

/**
 * Creates a Bootstrap dropdown for row actions
 */
function createActionsDropdown(actions, row, rowIndex) {
  const wrapper = document.createElement("div");
  wrapper.className = "dropdown";

  const toggleBtn = document.createElement("button");
  toggleBtn.className = "btn btn-sm btn-secondary";
  toggleBtn.type = "button";
  toggleBtn.setAttribute("data-bs-toggle", "dropdown");
  toggleBtn.setAttribute("aria-expanded", "false");
  toggleBtn.innerHTML = '<i class="bi bi-three-dots-vertical"></i>';

  const menu = document.createElement("ul");
  menu.className = "dropdown-menu";

  actions.forEach((action) => {
    const li = document.createElement("li");
    const btn = document.createElement("button");
    btn.className = "dropdown-item";
    btn.textContent = action.label;
    btn.onclick = () => action.onClick(row, rowIndex);
    li.appendChild(btn);
    menu.appendChild(li);
  });

  wrapper.append(toggleBtn, menu);
  return wrapper;
}
