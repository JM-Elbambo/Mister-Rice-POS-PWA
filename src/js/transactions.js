import PaginationComponent from './component_pagination.js';

// --- Transactions Data (static for now, can be replaced with dynamic data) ---
// REplace date with epoch time for easier comparison
const cachedData = {
    "lastUpdated": 1756674120,
    "transactions": [
        {
            "id": "TXN-2025-001",
            "date": "2025-08-01",
            "time": "09:15",
            "items": [{"name": "Rice", "quantity": 5}, {"name": "Eggs"}, {"name": "Soy Sauce"}, {"name": "Soy Sauce"}],
            "amount": 245.50,
            "status": "completed"
        },
        {
            "id": "TXN-2025-002",
            "date": "2025-08-01",
            "time": "11:32",
            "items": [{"name": "Milk"}, {"name": "Bread"}],
            "amount": 135.00,
            "status": "completed"
        },
        {
            "id": "TXN-2025-003",
            "date": "2025-08-01",
            "time": "13:47",
            "items": [{"name": "Chicken"}, {"name": "Garlic"}, {"name": "Onions"}],
            "amount": 390.75,
            "status": "refunded"
        },
        {
            "id": "TXN-2025-004",
            "date": "2025-08-02",
            "time": "08:20",
            "items": [{"name": "Rice"}, {"name": "Cooking Oil"}],
            "amount": 520.00,
            "status": "completed"
        },
        {
            "id": "TXN-2025-005",
            "date": "2025-08-02",
            "time": "10:55",
            "items": [{"name": "Bananas"}, {"name": "Milk"}, {"name": "Oats"}],
            "amount": 210.25,
            "status": "completed"
        },
        {
            "id": "TXN-2025-006",
            "date": "2025-08-02",
            "time": "14:15",
            "items": [{"name": "Fish"}, {"name": "Soy Sauce"}, {"name": "Vinegar"}],
            "amount": 330.10,
            "status": "completed"
        },
        {
            "id": "TXN-2025-007",
            "date": "2025-08-03",
            "time": "09:10",
            "items": [{"name": "Bread"}, {"name": "Butter"}],
            "amount": 175.00,
            "status": "completed"
        },
        {
            "id": "TXN-2025-008",
            "date": "2025-08-03",
            "time": "12:05",
            "items": [{"name": "Chicken"}, {"name": "Rice"}],
            "amount": 480.00,
            "status": "completed"
        },
        {
            "id": "TXN-2025-009",
            "date": "2025-08-03",
            "time": "16:20",
            "items": [{"name": "Sugar"}, {"name": "Coffee"}, {"name": "Creamer"}],
            "amount": 260.75,
            "status": "refunded"
        },
        {
            "id": "TXN-2025-010",
            "date": "2025-08-04",
            "time": "08:55",
            "items": [{"name": "Milk"}, {"name": "Eggs"}, {"name": "Cheese"}],
            "amount": 315.40,
            "status": "completed"
        },
        {
            "id": "TXN-2025-011",
            "date": "2025-08-04",
            "time": "11:45",
            "items": [{"name": "Rice"}, {"name": "Pork"}],
            "amount": 540.00,
            "status": "completed"
        },
        {
            "id": "TXN-2025-012",
            "date": "2025-08-04",
            "time": "15:00",
            "items": [{"name": "Onions"}, {"name": "Garlic"}, {"name": "Tomatoes"}],
            "amount": 190.00,
            "status": "completed"
        },
        {
            "id": "TXN-2025-013",
            "date": "2025-08-05",
            "time": "10:10",
            "items": [{"name": "Chicken"}, {"name": "Cooking Oil"}],
            "amount": 450.80,
            "status": "completed"
        },
        {
            "id": "TXN-2025-014",
            "date": "2025-08-05",
            "time": "13:30",
            "items": [{"name": "Bananas"}, {"name": "Apples"}],
            "amount": 220.50,
            "status": "completed"
        },
        {
            "id": "TXN-2025-015",
            "date": "2025-08-05",
            "time": "17:20",
            "items": [{"name": "Eggs"}, {"name": "Rice"}, {"name": "Soy Sauce"}],
            "amount": 290.25,
            "status": "completed"
        },
        {
            "id": "TXN-2025-016",
            "date": "2025-08-06",
            "time": "09:40",
            "items": [{"name": "Fish"}, {"name": "Lemon"}],
            "amount": 360.60,
            "status": "completed"
        },
        {
            "id": "TXN-2025-017",
            "date": "2025-08-06",
            "time": "12:25",
            "items": [{"name": "Bread"}, {"name": "Jam"}, {"name": "Peanut Butter"}],
            "amount": 198.90,
            "status": "completed"
        },
        {
            "id": "TXN-2025-018",
            "date": "2025-08-06",
            "time": "14:50",
            "items": [{"name": "Rice"}, {"name": "Cooking Oil"}, {"name": "Salt"}],
            "amount": 505.00,
            "status": "refunded"
        },
        {
            "id": "TXN-2025-019",
            "date": "2025-08-07",
            "time": "10:15",
            "items": [{"name": "Milk"}, {"name": "Cereal"}],
            "amount": 230.00,
            "status": "completed"
        },
        {
            "id": "TXN-2025-020",
            "date": "2025-08-07",
            "time": "15:30",
            "items": [{"name": "Chicken"}, {"name": "Soy Sauce"}, {"name": "Vinegar"}, {"name": "Onions"}],
            "amount": 480.75,
            "status": "completed"
        }
    ]
};

// Current filtered data (starts as all data, gets modified by filters)
let currentFilteredData = [...cachedData.transactions];

// Initialize the pagination component
const transactionsPagination = new PaginationComponent({
    container: document.querySelector('#transactionsPaginationContainer'),
    totalItems: currentFilteredData.length,
    onPageChange: loadTransactions
});

// Function to load transactions for a specific page
function loadTransactions(pageInfo) {
    try {
        // Show loading state
        const tbody = document.querySelector('#transactionsTableBody');
        tbody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-4">
                    <i class="fas fa-spinner fa-spin me-2"></i>Loading transactions...
                </td>
            </tr>
        `;
        
        // TODO: Simulate async loading (remove setTimeout for real usage)
        setTimeout(() => {
            // Calculate which transactions to show
            const startIndex = pageInfo.startItem;
            const endIndex = Math.min(pageInfo.startItem + transactionsPagination.itemsPerPage, currentFilteredData.length);
            const pageTransactions = currentFilteredData.slice(startIndex, endIndex);
            
            // Update table content
            if (pageTransactions.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center py-4 text-muted">
                            <i class="fas fa-inbox me-2"></i>No transactions found
                        </td>
                    </tr>
                `;
                return;
            }
            
            tbody.innerHTML = pageTransactions.map(transaction => `
                <tr>
                    <td>
                        <span class="fw-medium">${transaction.id}</span>
                    </td>
                    <td>
                        <div>
                            <div>${transaction.date}</div>
                            <small class="text-muted">${transaction.time}</small>
                        </div>
                    </td>
                    <td>
                        <div>
                            ${transaction.items.slice(0, 3).map(item => 
                                `<div>${item.name} <span class="text-muted">${item.quantity ? "x" + item.quantity : ""}</span></div>`
                            ).join('')}
                            ${transaction.items.length > 3 ? 
                                `<small class="text-muted">+ ${transaction.items.length - 3} more items</small>` : 
                                ''
                            }
                        </div>
                    </td>
                    <td class="fw-bold text-${transaction.status === 'refunded' ? 'danger' : 'success'}">
                        ₱${transaction.amount.toFixed(2)}
                    </td>
                    <td>
                        <span class="badge bg-${transaction.status === 'completed' ? 'success' : 'danger'}">
                            ${transaction.status === 'completed' ? 'Completed' : 'Refunded'}
                        </span>
                    </td>
                    <td>
                        <div class="dropdown">
                            <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                                <i class="fas fa-ellipsis-v"></i>
                            </button>
                            <ul class="dropdown-menu">
                                <li><a class="dropdown-item" href="#" data-action="view" data-id="${transaction.id}">
                                    <i class="fas fa-eye me-2"></i>View Details
                                </a></li>
                                ${transaction.status === 'completed' ? `
                                    <li><a class="dropdown-item" href="#" data-action="print" data-id="${transaction.id}">
                                        <i class="fas fa-print me-2"></i>Print Receipt
                                    </a></li>
                                    <li><hr class="dropdown-divider"></li>
                                    <li><a class="dropdown-item text-danger" href="#" data-action="refund" data-id="${transaction.id}">
                                        <i class="fas fa-undo me-2"></i>Refund
                                    </a></li>
                                ` : `
                                    <li><a class="dropdown-item" href="#" data-action="view-refund" data-id="${transaction.id}">
                                        <i class="fas fa-file-alt me-2"></i>View Refund
                                    </a></li>
                                `}
                            </ul>
                        </div>
                    </td>
                </tr>
            `).join('');
            
            // Bind dropdown actions
            bindDropdownActions();
        }, 200); // Small delay to show loading state
        
    } catch (error) {
        console.error('Error loading transactions:', error);
        const tbody = document.querySelector('#transactionsTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4 text-danger">
                        <i class="fas fa-exclamation-triangle me-2"></i>Error loading transactions
                    </td>
                </tr>
            `;
        }
    }
}

// Function to bind dropdown actions
function bindDropdownActions() {
    const actionLinks = document.querySelectorAll('[data-action]');
    actionLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const action = this.getAttribute('data-action');
            const transactionId = this.getAttribute('data-id');
            handleTransactionAction(action, transactionId);
        });
    });
}

// Function to handle transaction actions
function handleTransactionAction(action, transactionId) {
    switch(action) {
        case 'view':
            console.log('View transaction:', transactionId);
            // Implement view logic
            break;
        case 'print':
            console.log('Print receipt for:', transactionId);
            // Implement print logic
            break;
        case 'refund':
            console.log('Refund transaction:', transactionId);
            // Implement refund logic
            break;
        case 'view-refund':
            console.log('View refund for:', transactionId);
            // Implement view refund logic
            break;
    }
}

// Function to apply filters
function applyFilters() {
    const statusFilter = document.getElementById('statusFilter')?.value || '';
    const dateFilter = document.getElementById('dateFilter')?.value || 'today';
    
    // Start with all transactions
    currentFilteredData = [...cachedData.transactions];
    
    // Apply status filter
    if (statusFilter && statusFilter !== '') {
        currentFilteredData = currentFilteredData.filter(transaction => 
            transaction.status === statusFilter
        );
    }
    
    // TODO: Apply date filter (simplified - you can enhance this)
    if (dateFilter === 'today') {
        const today = new Date().toISOString().split('T')[0];
        // For demo purposes, show recent transactions
        // In real app, you'd filter by actual today's date
    } else if (dateFilter === 'yesterday') {
        // Filter for yesterday
    } else if (dateFilter === 'week') {
        // Filter for this week
    }
    // Add more date filter logic as needed
    
    // Update pagination with new filtered data
    transactionsPagination.update({ 
        totalItems: currentFilteredData.length, 
        currentPage: 1 
    });
    
    // Load first page of filtered data
    loadTransactions(transactionsPagination.getCurrentPageInfo());
}

// Utility functions
function refreshTransactions() {
    applyFilters(); // This will refresh with current filters
}

function goToFirstPage() {
    transactionsPagination.firstPage();
}

function updateTransactionCount(newTotal) {
    transactionsPagination.update({ totalItems: newTotal });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Initializing transactions page...');
    
    // Load initial data
    loadTransactions(transactionsPagination.getCurrentPageInfo());
    
    // Set up filter event listeners (with null checks)
    const statusFilter = document.getElementById('statusFilter');
    const dateFilter = document.getElementById('dateFilter');
    const resetFiltersBtn = document.getElementById('resetFiltersBtn');
    
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
    }
    
    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            // Show/hide custom date inputs based on selection
            const dateFromContainer = document.getElementById('dateFromContainer');
            const dateToContainer = document.getElementById('dateToContainer');
            
            if (dateFromContainer && dateToContainer) {
                if (this.value === 'custom') {
                    dateFromContainer.style.display = 'block';
                    dateToContainer.style.display = 'block';
                } else {
                    dateFromContainer.style.display = 'none';
                    dateToContainer.style.display = 'none';
                }
            }
            
            applyFilters();
        });
    }
    
    if (resetFiltersBtn) {
        resetFiltersBtn.addEventListener('click', function() {
            if (statusFilter) statusFilter.value = '';
            if (dateFilter) dateFilter.value = 'today';
            
            // Hide custom date inputs
            const dateFromContainer = document.getElementById('dateFromContainer');
            const dateToContainer = document.getElementById('dateToContainer');
            if (dateFromContainer) dateFromContainer.style.display = 'none';
            if (dateToContainer) dateToContainer.style.display = 'none';
            
            // Reset to show all data
            currentFilteredData = [...cachedData.transactions];
            transactionsPagination.update({ 
                totalItems: currentFilteredData.length, 
                currentPage: 1 
            });
            loadTransactions(transactionsPagination.getCurrentPageInfo());
        });
    }
});

// Export for potential external use
export { 
    refreshTransactions, 
    goToFirstPage, 
    updateTransactionCount, 
    transactionsPagination 
};
