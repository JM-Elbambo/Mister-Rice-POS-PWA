export default class PaginationComponent {
    constructor(options = {}) {
        this.container = options.container || null;             // DOM element to render into
        this.totalItems = options.totalItems || 0;              // Total number of items
        this.currentPage = options.currentPage || 1;            // Starting page
        this.onPageChange = options.onPageChange || (() => {}); // Callback when page changes
        
        // Customizations
        this.itemsPerPage = options.itemsPerPage || 10;         // Items per page
        this.maxVisiblePages = options.maxVisiblePages || 5;    // Page numbers to show
        this.showInfo = options.showInfo !== false;             // Show "Showing X-Y of Z records". Default true
        this.itemName = options.itemName || 'records';          // Item name for display
        
        this.updateTotalPages();
        
        if (this.container) {
            this.render();
        }
    }

    // Calculate total pages
    updateTotalPages() {
        this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage) || 1;
        
        // Ensure current page is within bounds
        if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;
        } else if (this.currentPage < 1) {
            this.currentPage = 1;
        }
    }

    // Get current page info
    getCurrentPageInfo() {
        const startItem = (this.currentPage - 1) * this.itemsPerPage;
        const endItem = Math.min(startItem + this.itemsPerPage, this.totalItems);
        
        return {
            currentPage: this.currentPage,
            totalPages: this.totalPages,
            startItem,
            endItem: endItem - 1, // Make it 0-based for array slicing
            totalItems: this.totalItems,
            itemsOnCurrentPage: Math.max(0, endItem - startItem)
        };
    }

    // Update pagination data
    update(newOptions = {}) {
        const oldCurrentPage = this.currentPage;
        
        // Update properties
        Object.assign(this, newOptions);
        
        // Recalculate total pages
        this.updateTotalPages();
        
        // Re-render if we have a container
        if (this.container) {
            this.render();
        }
        
        // Trigger callback if page actually changed or if it's a forced update
        if (this.currentPage !== oldCurrentPage || newOptions.forceCallback) {
            this.onPageChange(this.getCurrentPageInfo());
        }
    }

    // Generate page numbers to display
    getVisiblePages() {
        if (this.totalPages <= 1) return [];
        
        const pages = [];
        const half = Math.floor(this.maxVisiblePages / 2);
        
        let start = Math.max(1, this.currentPage - half);
        let end = Math.min(this.totalPages, start + this.maxVisiblePages - 1);
        
        // Adjust start if we're near the end
        if (end - start + 1 < this.maxVisiblePages) {
            start = Math.max(1, end - this.maxVisiblePages + 1);
        }
        
        // Add first page and ellipsis if needed
        if (start > 1) {
            pages.push(1);
            if (start > 2) {
                pages.push('...');
            }
        }
        
        // Add visible pages
        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        
        // Add ellipsis and last page if needed
        if (end < this.totalPages) {
            if (end < this.totalPages - 1) {
                pages.push('...');
            }
            pages.push(this.totalPages);
        }
        
        return pages;
    }

    // Handle page change
    goToPage(page) {
        if (page < 1 || page > this.totalPages || page === this.currentPage) {
            return false;
        }
        
        this.currentPage = page;
        this.render();
        this.onPageChange(this.getCurrentPageInfo());
        return true;
    }

    nextPage() {
        return this.goToPage(this.currentPage + 1);
    }

    prevPage() {
        return this.goToPage(this.currentPage - 1);
    }

    firstPage() {
        return this.goToPage(1);
    }

    lastPage() {
        return this.goToPage(this.totalPages);
    }

    // Generate HTML
    generateHTML() {
        // Don't show pagination if no items or only one page
        if (this.totalItems === 0) {
            return this.showInfo ? `
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">No ${this.itemName} found</small>
                    <div></div>
                </div>
            ` : '';
        }
        
        if (this.totalPages <= 1) {
            return this.showInfo ? `
                <div class="d-flex justify-content-between align-items-center">
                    <small class="text-muted">Showing all ${this.totalItems} ${this.itemName}</small>
                    <div></div>
                </div>
            ` : '';
        }

        const pageInfo = this.getCurrentPageInfo();
        const visiblePages = this.getVisiblePages();
        
        // Fix the display calculation
        const displayStart = pageInfo.startItem + 1; // Convert from 0-based to 1-based
        const displayEnd = pageInfo.startItem + pageInfo.itemsOnCurrentPage;
        
        const infoHtml = this.showInfo ? `
            <small class="text-muted">
                Showing ${displayStart}-${displayEnd} of ${this.totalItems} ${this.itemName}
            </small>
        ` : '<div></div>';

        const paginationHtml = `
            <nav aria-label="Pagination Navigation">
                <ul class="pagination pagination-sm mb-0">
                    <li class="page-item ${this.currentPage === 1 ? 'disabled' : ''}">
                        <a class="page-link" href="#" data-page="prev" tabindex="${this.currentPage === 1 ? '-1' : '0'}" 
                           ${this.currentPage === 1 ? 'aria-disabled="true"' : ''}>
                            <i class="fas fa-chevron-left"></i>
                            <span class="sr-only">Previous</span>
                        </a>
                    </li>
                    ${visiblePages.map(page => {
                        if (page === '...') {
                            return '<li class="page-item disabled"><span class="page-link text-muted">...</span></li>';
                        }
                        return `
                            <li class="page-item ${page === this.currentPage ? 'active' : ''}">
                                <a class="page-link" href="#" data-page="${page}" 
                                   ${page === this.currentPage ? 'aria-current="page"' : ''}>
                                    ${page}
                                </a>
                            </li>
                        `;
                    }).join('')}
                    <li class="page-item ${this.currentPage === this.totalPages ? 'disabled' : ''}">
                        <a class="page-link" href="#" data-page="next" tabindex="${this.currentPage === this.totalPages ? '-1' : '0'}" 
                           ${this.currentPage === this.totalPages ? 'aria-disabled="true"' : ''}>
                            <i class="fas fa-chevron-right"></i>
                            <span class="sr-only">Next</span>
                        </a>
                    </li>
                </ul>
            </nav>
        `;

        return `
            <div class="d-flex justify-content-between align-items-center">
                ${infoHtml}
                ${paginationHtml}
            </div>
        `;
    }

    // Render to DOM
    render() {
        if (!this.container) {
            console.warn('Pagination: No container element provided');
            return;
        }
        
        this.container.innerHTML = this.generateHTML();
        this.bindEvents();
    }

    // Bind click events
    bindEvents() {
        if (!this.container) return;
        
        const links = this.container.querySelectorAll('[data-page]:not(.disabled [data-page])');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                if (link.closest('.disabled')) {
                    return;
                }
                
                const page = e.currentTarget.getAttribute('data-page');
                
                if (page === 'prev') {
                    this.prevPage();
                } else if (page === 'next') {
                    this.nextPage();
                } else {
                    const pageNumber = parseInt(page);
                    if (!isNaN(pageNumber)) {
                        this.goToPage(pageNumber);
                    }
                }
            });
        });
    }

    // Get pagination statistics
    getStats() {
        const pageInfo = this.getCurrentPageInfo();
        return {
            currentPage: this.currentPage,
            totalPages: this.totalPages,
            totalItems: this.totalItems,
            itemsPerPage: this.itemsPerPage,
            startItem: pageInfo.startItem,
            endItem: pageInfo.endItem,
            itemsOnCurrentPage: pageInfo.itemsOnCurrentPage,
            hasNextPage: this.currentPage < this.totalPages,
            hasPrevPage: this.currentPage > 1
        };
    }

    // Reset to first page
    reset() {
        this.currentPage = 1;
        this.render();
        this.onPageChange(this.getCurrentPageInfo());
    }

    // Static method to create pagination
    static create(options) {
        return new PaginationComponent(options);
    }
}
