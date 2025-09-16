/**
 * Table Filter Component
 * @param {Object} options
 * @param {string} [options.searchPlaceholder="Search..."] - Search input placeholder
 * @param {Array} [options.filters=[]] - Array of filter objects:
 *   { id: string, label: string, options: [{value: string, label: string}] }
 * @param {Array} [options.sortOptions=[]] - Array of sort options:
 *   { value: string, label: string }
 * @param {function} options.onFilter - Callback when filters change: (filterData) => {}
 * @param {boolean} [options.showReset=true] - Show reset button
 */
export default function TableFilter({
  searchPlaceholder = "Search...",
  filters = [],
  sortOptions = [],
  onFilter,
  showReset = true,
}) {
  const container = document.createElement("div");
  container.className = "card mb-4";

  const cardBody = document.createElement("div");
  cardBody.className = "card-body";

  const row = document.createElement("div");
  row.className = "row g-3";

  // Search input
  const searchCol = document.createElement("div");
  searchCol.className = "col-md-4";

  const searchGroup = document.createElement("div");
  searchGroup.className = "input-group";

  const searchIcon = document.createElement("span");
  searchIcon.className = "input-group-text";
  searchIcon.innerHTML = '<i class="bi bi-search"></i>';

  const searchInput = document.createElement("input");
  searchInput.type = "text";
  searchInput.className = "form-control";
  searchInput.placeholder = searchPlaceholder;

  searchGroup.append(searchIcon, searchInput);
  searchCol.appendChild(searchGroup);
  row.appendChild(searchCol);

  // Filter selects
  const filterElements = {};
  filters.forEach((filter) => {
    const col = document.createElement("div");
    col.className = "col-md-2";

    const select = document.createElement("select");
    select.className = "form-select";
    select.id = filter.id;

    // Add default "All" option
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = filter.label;
    select.appendChild(defaultOption);

    // Add filter options
    filter.options.forEach((option) => {
      const optionEl = document.createElement("option");
      optionEl.value = option.value;
      optionEl.textContent = option.label;
      select.appendChild(optionEl);
    });

    filterElements[filter.id] = select;
    col.appendChild(select);
    row.appendChild(col);
  });

  // Sort select
  let sortSelect = null;
  if (sortOptions.length > 0) {
    const sortCol = document.createElement("div");
    sortCol.className = "col-md-2";

    sortSelect = document.createElement("select");
    sortSelect.className = "form-select";

    sortOptions.forEach((option) => {
      const optionEl = document.createElement("option");
      optionEl.value = option.value;
      optionEl.textContent = option.label;
      sortSelect.appendChild(optionEl);
    });

    sortCol.appendChild(sortSelect);
    row.appendChild(sortCol);
  }

  // Reset button
  let resetButton = null;
  if (showReset) {
    const resetCol = document.createElement("div");
    resetCol.className = "col-md-2";

    resetButton = document.createElement("button");
    resetButton.className = "btn btn-outline-secondary w-100";
    resetButton.innerHTML = '<i class="bi bi-arrow-clockwise me-2"></i>Reset';

    resetCol.appendChild(resetButton);
    row.appendChild(resetCol);
  }

  // Get current filter state
  function getFilterData() {
    const filterData = {
      search: searchInput.value.trim(),
      filters: {},
      sort: sortSelect ? sortSelect.value : null,
    };

    Object.keys(filterElements).forEach((key) => {
      filterData.filters[key] = filterElements[key].value;
    });

    return filterData;
  }

  // Reset all filters
  function resetFilters() {
    searchInput.value = "";
    Object.values(filterElements).forEach((select) => {
      select.selectedIndex = 0;
    });
    if (sortSelect) sortSelect.selectedIndex = 0;

    if (onFilter) onFilter(getFilterData());
  }

  // Event listeners
  function handleChange() {
    if (onFilter) onFilter(getFilterData());
  }

  // Debounced search
  let searchTimeout;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(handleChange, 300);
  });

  // Filter and sort change events
  Object.values(filterElements).forEach((select) => {
    select.addEventListener("change", handleChange);
  });

  if (sortSelect) {
    sortSelect.addEventListener("change", handleChange);
  }

  if (resetButton) {
    resetButton.addEventListener("click", resetFilters);
  }

  // Public API
  container.getFilterData = getFilterData;
  container.resetFilters = resetFilters;
  container.setSearchValue = (value) => {
    searchInput.value = value;
    handleChange();
  };
  container.setFilterValue = (filterId, value) => {
    if (filterElements[filterId]) {
      filterElements[filterId].value = value;
      handleChange();
    }
  };
  container.setSortValue = (value) => {
    if (sortSelect) {
      sortSelect.value = value;
      handleChange();
    }
  };

  // Build DOM
  cardBody.appendChild(row);
  container.appendChild(cardBody);

  return container;
}
