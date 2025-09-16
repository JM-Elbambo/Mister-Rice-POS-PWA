/**
 * Sliding Window Pagination Component
 * @param {Object} options
 * @param {number} options.totalItems - total number of items
 * @param {number} options.itemsPerPage - items per page
 * @param {function} options.onPageChange - callback when page changes
 * @param {number} [options.windowSize=5] - number of page buttons to show
 */
export default function Pagination({
  totalItems,
  itemsPerPage,
  onPageChange,
  windowSize = 5,
}) {
  let currentPage = 1;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const container = document.createElement("div");
  container.className = "d-flex align-items-center gap-3";

  const infoSpan = document.createElement("span");
  infoSpan.className = "text-muted small";

  const nav = document.createElement("nav");
  const ul = document.createElement("ul");
  ul.className = "pagination mb-0";

  function createButton(
    content,
    page = null,
    isActive = false,
    isDisabled = false
  ) {
    const li = document.createElement("li");
    li.className = `page-item${isActive ? " active" : ""}${
      isDisabled ? " disabled" : ""
    }`;

    const btn = document.createElement("button");
    btn.className = "page-link";
    btn.innerHTML = content;

    if (!isDisabled && page) {
      btn.onclick = () => setPage(page);
    }

    li.appendChild(btn);
    return li;
  }

  function getWindow() {
    const half = Math.floor(windowSize / 2);
    let start = Math.max(1, currentPage - half);
    let end = Math.min(totalPages, start + windowSize - 1);

    // Adjust start if we're near the end
    if (end - start + 1 < windowSize && start > 1) {
      start = Math.max(1, end - windowSize + 1);
    }

    return { start, end };
  }

  function updateInfo() {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);
    infoSpan.textContent = `Showing ${startItem}-${endItem} of ${totalItems}`;
  }

  function render() {
    ul.innerHTML = "";
    updateInfo();

    if (totalPages <= 1) return;

    const { start, end } = getWindow();

    // First button
    ul.appendChild(createButton("&laquo;", 1, false, currentPage === 1));

    // Previous button
    ul.appendChild(
      createButton("&lsaquo;", currentPage - 1, false, currentPage === 1)
    );

    // Page numbers
    for (let i = start; i <= end; i++) {
      ul.appendChild(createButton(i.toString(), i, i === currentPage));
    }

    // Next button
    ul.appendChild(
      createButton(
        "&rsaquo;",
        currentPage + 1,
        false,
        currentPage === totalPages
      )
    );

    // Last button
    ul.appendChild(
      createButton("&raquo;", totalPages, false, currentPage === totalPages)
    );
  }

  function setPage(page) {
    if (page < 1 || page > totalPages) return;
    currentPage = page;
    render();
    onPageChange(currentPage);
  }

  // Public API
  container.goToPage = (page) => setPage(page);
  container.getCurrentPage = () => currentPage;
  container.getTotalPages = () => totalPages;
  container.getPageInfo = () => ({
    currentPage,
    totalPages,
    startItem: (currentPage - 1) * itemsPerPage + 1,
    endItem: Math.min(currentPage * itemsPerPage, totalItems),
    totalItems,
  });

  render();
  nav.appendChild(ul);
  container.appendChild(infoSpan);
  container.appendChild(nav);
  return container;
}
