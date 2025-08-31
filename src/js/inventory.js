import { Modal, Toast } from 'bootstrap';
import PaginationComponent from './component_pagination.js';

// Sample inventory data
let inventory = [
    { id: 1, name: "Jasmine Rice 5kg", category: "Premium", barcode: "1234567890123", price: 250.00, stock: 45, minStock: 10 },
    { id: 2, name: "Basmati Rice 1kg", category: "Premium", barcode: "1234567890124", price: 180.00, stock: 23, minStock: 15 },
    { id: 3, name: "Brown Rice 2kg", category: "Organic", barcode: "1234567890125", price: 320.00, stock: 8, minStock: 12 },
    { id: 4, name: "White Rice 10kg", category: "Regular", barcode: "1234567890126", price: 450.00, stock: 32, minStock: 8 },
    { id: 5, name: "Sticky Rice 1kg", category: "Regular", barcode: "1234567890127", price: 200.00, stock: 15, minStock: 10 },
    { id: 6, name: "Red Rice 1kg", category: "Organic", barcode: "1234567890128", price: 150.00, stock: 0, minStock: 8 },
    { id: 7, name: "Organic Rice 2kg", category: "Organic", barcode: "1234567890129", price: 380.00, stock: 12, minStock: 6 },
    { id: 8, name: "Premium Jasmine 1kg", category: "Premium", barcode: "1234567890130", price: 120.00, stock: 28, minStock: 20 },
    { id: 9, name: "Black Rice 500g", category: "Premium", barcode: "1234567890131", price: 95.00, stock: 5, minStock: 10 },
    { id: 10, name: "Wild Rice Mix 1kg", category: "Premium", barcode: "1234567890132", price: 220.00, stock: 18, minStock: 8 },
    { id: 11, name: "Parboiled Rice 5kg", category: "Regular", barcode: "1234567890133", price: 275.00, stock: 22, minStock: 12 },
    { id: 12, name: "Long Grain Rice 2kg", category: "Regular", barcode: "1234567890134", price: 165.00, stock: 35, minStock: 15 },
    { id: 13, name: "Short Grain Rice 1kg", category: "Regular", barcode: "1234567890135", price: 125.00, stock: 0, minStock: 20 },
    { id: 14, name: "Arborio Rice 500g", category: "Premium", barcode: "1234567890136", price: 160.00, stock: 14, minStock: 6 },
    { id: 15, name: "Calrose Rice 5kg", category: "Regular", barcode: "1234567890137", price: 285.00, stock: 7, minStock: 10 },
    // Adding more sample data to demonstrate pagination
    { id: 16, name: "Sushi Rice 2kg", category: "Premium", barcode: "1234567890138", price: 340.00, stock: 19, minStock: 8 },
    { id: 17, name: "Thai Fragrant Rice 1kg", category: "Premium", barcode: "1234567890139", price: 195.00, stock: 31, minStock: 12 },
    { id: 18, name: "Glutinous Rice 1kg", category: "Regular", barcode: "1234567890140", price: 175.00, stock: 0, minStock: 15 },
    { id: 19, name: "Carolina Rice 5kg", category: "Regular", barcode: "1234567890141", price: 290.00, stock: 26, minStock: 10 },
    { id: 20, name: "Forbidden Black Rice 500g", category: "Organic", barcode: "1234567890142", price: 240.00, stock: 9, minStock: 5 },
    { id: 21, name: "Spanish Bomba Rice 1kg", category: "Premium", barcode: "1234567890143", price: 420.00, stock: 13, minStock: 6 },
    { id: 22, name: "Indian Basmati Extra Long 2kg", category: "Premium", barcode: "1234567890144", price: 380.00, stock: 17, minStock: 8 },
    { id: 23, name: "Vietnamese Rice 10kg", category: "Regular", barcode: "1234567890145", price: 425.00, stock: 0, minStock: 12 },
    { id: 24, name: "Himalayan Red Rice 1kg", category: "Organic", barcode: "1234567890146", price: 280.00, stock: 21, minStock: 10 },
    { id: 25, name: "Purple Rice 500g", category: "Organic", barcode: "1234567890147", price: 190.00, stock: 14, minStock: 8 }
];

// Current filtered data (starts as all data, gets modified by filters)
let filteredInventory = [...inventory];

// Initialize pagination component
const inventoryPagination = new PaginationComponent({
    container: document.querySelector('#inventoryPaginationContainer'),
    totalItems: filteredInventory.length,
    onPageChange: function(pageInfo) {
        console.log('Inventory page changed:', pageInfo);
        loadInventory(pageInfo);
    }
});

// Initialize page
function initializeInventory() {
    updateQuickStats();
    loadInventory(inventoryPagination.getCurrentPageInfo());
}

function attachEventListeners() {
    // Search and filters
    const searchInput = document.getElementById('searchInventory');
    const categoryFilter = document.getElementById('categoryFilter');
    const stockFilter = document.getElementById('stockFilter');
    const sortBy = document.getElementById('sortBy');
    
    if (searchInput) searchInput.addEventListener('input', applyFiltersAndPagination);
    if (categoryFilter) categoryFilter.addEventListener('change', applyFiltersAndPagination);
    if (stockFilter) stockFilter.addEventListener('change', applyFiltersAndPagination);
    if (sortBy) sortBy.addEventListener('change', sortInventory);
    
    // Static buttons
    const resetFiltersBtn = document.querySelector('[data-action="reset-filters"]');
    const addProductBtn = document.querySelector('[data-action="add-product"]');
    
    if (resetFiltersBtn) resetFiltersBtn.addEventListener('click', resetFilters);
    if (addProductBtn) {
        addProductBtn.addEventListener('click', () => {
            const addModal = document.getElementById('addProductModal');
            if (addModal) new Modal(addModal).show();
        });
    }
    
    // Modal buttons
    const saveNewProductBtn = document.querySelector('[data-action="save-new-product"]');
    const updateProductBtn = document.querySelector('[data-action="update-product"]');
    const processStockBtn = document.querySelector('[data-action="process-stock-adjustment"]');
    
    if (saveNewProductBtn) saveNewProductBtn.addEventListener('click', addNewProduct);
    if (updateProductBtn) updateProductBtn.addEventListener('click', updateProduct);
    if (processStockBtn) processStockBtn.addEventListener('click', processStockAdjustment);
    
    // Adjustment type change
    const adjustmentType = document.getElementById('adjustmentType');
    if (adjustmentType) adjustmentType.addEventListener('change', updateAdjustmentInput);
    
    // Table actions (event delegation for dynamically generated buttons)
    const tableBody = document.getElementById('inventoryTableBody');
    if (tableBody) tableBody.addEventListener('click', handleTableActions);
}

// Handle table action buttons (edit, adjust stock, delete)
function handleTableActions(e) {
    const button = e.target.closest('button');
    if (!button) return;
    
    const productId = parseInt(button.dataset.productId);
    const action = button.dataset.action;
    
    switch(action) {
        case 'edit': editProduct(productId); break;
        case 'adjust-stock': openStockAdjustment(productId); break;
        case 'delete': deleteProduct(productId); break;
    }
}

function updateQuickStats() {
    const totalProducts = inventory.length;
    const inStock = inventory.filter(item => item.stock > item.minStock).length;
    const lowStock = inventory.filter(item => item.stock > 0 && item.stock <= item.minStock).length;
    const outOfStock = inventory.filter(item => item.stock === 0).length;

    // Update DOM elements with null checks
    const elements = {
        totalProducts: document.getElementById('totalProducts'),
        inStockCount: document.getElementById('inStockCount'),
        lowStockCount: document.getElementById('lowStockCount'),
        outOfStockCount: document.getElementById('outOfStockCount')
    };

    if (elements.totalProducts) elements.totalProducts.textContent = totalProducts;
    if (elements.inStockCount) elements.inStockCount.textContent = inStock;
    if (elements.lowStockCount) elements.lowStockCount.textContent = lowStock;
    if (elements.outOfStockCount) elements.outOfStockCount.textContent = outOfStock;
}

function getStockStatus(item) {
    if (item.stock === 0) return { text: 'Out of Stock', class: 'danger' };
    if (item.stock <= item.minStock) return { text: 'Low Stock', class: 'warning' };
    return { text: 'In Stock', class: 'success' };
}

// Display inventory page with pagination
function loadInventory(pageInfo) {
    const tbody = document.getElementById('inventoryTableBody');
    
    // Show loading state
    tbody.innerHTML = `
        <tr>
            <td colspan="8" class="text-center py-4">
                <i class="fas fa-spinner fa-spin me-2"></i>Loading products...
            </td>
        </tr>
    `;
    
    // Simulate loading delay (remove in production)
    setTimeout(() => {
        if (filteredInventory.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4 text-muted">
                        <i class="fas fa-search fa-2x mb-2 d-block"></i>
                        <p class="mb-0">No products found matching your criteria</p>
                    </td>
                </tr>
            `;
            return;
        }

        // Calculate which products to show
        const startIndex = pageInfo.startItem;
        const endIndex = Math.min(pageInfo.startItem + inventoryPagination.itemsPerPage, filteredInventory.length);
        const pageProducts = filteredInventory.slice(startIndex, endIndex);

        tbody.innerHTML = pageProducts.map(item => {
            const status = getStockStatus(item);
            return `
                <tr>
                    <td>
                        <span class="fw-medium">${item.name}</span>
                    </td>
                    <td>
                        <span class="badge bg-secondary">${item.category}</span>
                    </td>
                    <td>
                        <code>${item.barcode}</code>
                    </td>
                    <td>
                        ₱${item.price.toFixed(2)}
                    </td>
                    <td>
                        <strong class="${item.stock === 0 ? 'text-danger' : item.stock <= item.minStock ? 'text-warning' : ''}">${item.stock}</strong>
                    </td>
                    <td>
                        <span class="text-muted">${item.minStock}</span>
                    </td>
                    <td>
                        <span class="badge bg-${status.class}">${status.text}</span>
                    </td>
                    <td>
                        <div class="btn-group btn-group-sm" role="group">
                            <button class="btn btn-outline-primary" data-action="edit" data-product-id="${item.id}" title="Edit Product">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-warning" data-action="adjust-stock" data-product-id="${item.id}" title="Adjust Stock">
                                <i class="fas fa-boxes"></i>
                            </button>
                            <button class="btn btn-outline-danger" data-action="delete" data-product-id="${item.id}" title="Delete Product">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
    }, 200);
}

// Apply filters and update pagination
function applyFiltersAndPagination() {
    const searchInput = document.getElementById('searchInventory');
    const categoryFilter = document.getElementById('categoryFilter');
    const stockFilter = document.getElementById('stockFilter');
    
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const categoryValue = categoryFilter ? categoryFilter.value : '';
    const stockValue = stockFilter ? stockFilter.value : '';

    filteredInventory = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm) || 
                            item.barcode.includes(searchTerm);
        const matchesCategory = !categoryValue || item.category === categoryValue;
        
        let matchesStock = true;
        if (stockValue === 'in-stock') matchesStock = item.stock > item.minStock;
        else if (stockValue === 'low-stock') matchesStock = item.stock > 0 && item.stock <= item.minStock;
        else if (stockValue === 'out-of-stock') matchesStock = item.stock === 0;

        return matchesSearch && matchesCategory && matchesStock;
    });

    // Apply current sorting
    applySortingToFiltered();

    // Update pagination with new filtered data
    inventoryPagination.update({ 
        totalItems: filteredInventory.length, 
        currentPage: 1 
    });

    // Display first page of filtered data
    loadInventory(inventoryPagination.getCurrentPageInfo());
}

// Apply current sorting to filtered inventory
function applySortingToFiltered() {
    const sortBy = document.getElementById('sortBy');
    
    const sortValue = sortBy.value;
    
    filteredInventory.sort((a, b) => {
        switch (sortValue) {
            case 'name': return a.name.localeCompare(b.name);
            case 'price': return a.price - b.price;
            case 'stock': return b.stock - a.stock;
            case 'category': return a.category.localeCompare(b.category);
            default: return 0;
        }
    });
}

function sortInventory() {
    applySortingToFiltered();
    loadInventory(inventoryPagination.getCurrentPageInfo());
}

function resetFilters() {
    const searchInput = document.getElementById('searchInventory');
    const categoryFilter = document.getElementById('categoryFilter');
    const stockFilter = document.getElementById('stockFilter');
    const sortBy = document.getElementById('sortBy');
    
    if (searchInput) searchInput.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (stockFilter) stockFilter.value = '';
    if (sortBy) sortBy.value = 'name';
    
    filteredInventory = [...inventory];
    
    // Update pagination and reset to first page
    inventoryPagination.update({ 
        totalItems: filteredInventory.length, 
        currentPage: 1 
    });
    
    loadInventory(inventoryPagination.getCurrentPageInfo());
}

function addNewProduct() {
    const form = document.getElementById('addProductForm');
    if (!form || !form.checkValidity()) {
        if (form) form.reportValidity();
        return;
    }

    const elements = {
        name: document.getElementById('newProductName'),
        category: document.getElementById('newProductCategory'),
        barcode: document.getElementById('newProductBarcode'),
        price: document.getElementById('newProductPrice'),
        stock: document.getElementById('newProductStock'),
        minStock: document.getElementById('newProductMinStock')
    };

    // Check if all elements exist
    const missingElements = Object.keys(elements).filter(key => !elements[key]);
    if (missingElements.length > 0) {
        console.error('Missing form elements:', missingElements);
        return;
    }

    const newProduct = {
        id: Math.max(...inventory.map(p => p.id)) + 1,
        name: elements.name.value,
        category: elements.category.value,
        barcode: elements.barcode.value,
        price: parseFloat(elements.price.value),
        stock: parseInt(elements.stock.value),
        minStock: parseInt(elements.minStock.value)
    };

    inventory.push(newProduct);
    
    // Update filtered inventory and pagination
    applyFiltersAndPagination();
    updateQuickStats();

    // Reset form and close modal
    form.reset();
    const modal = Modal.getInstance(document.getElementById('addProductModal'));
    if (modal) modal.hide();
    
    showToast('Product added successfully!', 'success');
}

function editProduct(productId) {
    const product = inventory.find(p => p.id === productId);
    if (!product) return;

    const elements = {
        id: document.getElementById('editProductId'),
        name: document.getElementById('editProductName'),
        category: document.getElementById('editProductCategory'),
        barcode: document.getElementById('editProductBarcode'),
        price: document.getElementById('editProductPrice'),
        minStock: document.getElementById('editProductMinStock')
    };

    // Check if all elements exist
    const missingElements = Object.keys(elements).filter(key => !elements[key]);
    if (missingElements.length > 0) {
        console.error('Missing edit form elements:', missingElements);
        return;
    }

    elements.id.value = product.id;
    elements.name.value = product.name;
    elements.category.value = product.category;
    elements.barcode.value = product.barcode;
    elements.price.value = product.price;
    elements.minStock.value = product.minStock;

    const editModal = document.getElementById('editProductModal');
    if (editModal) new Modal(editModal).show();
}

function updateProduct() {
    const productIdElement = document.getElementById('editProductId');
    if (!productIdElement) return;
    
    const productId = parseInt(productIdElement.value);
    const product = inventory.find(p => p.id === productId);
    
    if (!product) return;

    const elements = {
        name: document.getElementById('editProductName'),
        category: document.getElementById('editProductCategory'),
        barcode: document.getElementById('editProductBarcode'),
        price: document.getElementById('editProductPrice'),
        minStock: document.getElementById('editProductMinStock')
    };

    // Check if all elements exist
    const missingElements = Object.keys(elements).filter(key => !elements[key]);
    if (missingElements.length > 0) {
        console.error('Missing edit form elements:', missingElements);
        return;
    }

    product.name = elements.name.value;
    product.category = elements.category.value;
    product.barcode = elements.barcode.value;
    product.price = parseFloat(elements.price.value);
    product.minStock = parseInt(elements.minStock.value);

    // Update filtered inventory and display
    applyFiltersAndPagination();
    updateQuickStats();

    const editModal = document.getElementById('editProductModal');
    const modal = Modal.getInstance(editModal);
    if (modal) modal.hide();
    
    showToast('Product updated successfully!', 'success');
}

// Open stock adjustment modal for specific product
function openStockAdjustment(productId) {
    const product = inventory.find(p => p.id === productId);
    if (!product) return;

    const elements = {
        id: document.getElementById('adjustmentProductId'),
        name: document.getElementById('adjustmentProductName'),
        type: document.getElementById('adjustmentType'),
        quantity: document.getElementById('adjustmentQuantity'),
        reason: document.getElementById('adjustmentReason')
    };

    if (elements.id) elements.id.value = product.id;
    if (elements.name) elements.name.value = product.name;
    if (elements.type) elements.type.value = '';
    if (elements.quantity) elements.quantity.value = '';
    if (elements.reason) elements.reason.value = '';
    
    updateCurrentStockInfo();

    const stockModal = document.getElementById('stockAdjustmentModal');
    if (stockModal) new Modal(stockModal).show();
}

// Update adjustment input label based on type
function updateAdjustmentInput() {
    const adjustmentType = document.getElementById('adjustmentType');
    const label = document.getElementById('adjustmentQuantityLabel');
    const input = document.getElementById('adjustmentQuantity');

    if (!adjustmentType || !label || !input) return;

    const typeValue = adjustmentType.value;

    switch (typeValue) {
        case 'add':
            label.textContent = 'Quantity to Add';
            input.placeholder = 'Enter quantity to add...';
            break;
        case 'remove':
            label.textContent = 'Quantity to Remove';
            input.placeholder = 'Enter quantity to remove...';
            break;
        case 'set':
            label.textContent = 'New Stock Level';
            input.placeholder = 'Enter new stock level...';
            break;
        default:
            label.textContent = 'Quantity';
            input.placeholder = '';
    }
    
    updateCurrentStockInfo();
}

// Update current stock info display
function updateCurrentStockInfo() {
    const productIdElement = document.getElementById('adjustmentProductId');
    const infoDiv = document.getElementById('currentStockInfo');
    
    if (!productIdElement || !infoDiv) return;
    
    const productId = productIdElement.value;
    if (productId) {
        const product = inventory.find(p => p.id == productId);
        if (product) {
            const status = getStockStatus(product);
            infoDiv.innerHTML = `Current stock: <strong>${product.stock}</strong> | Minimum: ${product.minStock} | Status: <span class="text-${status.class}">${status.text}</span>`;
        }
    } else {
        infoDiv.innerHTML = '';
    }
}

function processStockAdjustment() {
    const elements = {
        id: document.getElementById('adjustmentProductId'),
        type: document.getElementById('adjustmentType'),
        quantity: document.getElementById('adjustmentQuantity'),
        reason: document.getElementById('adjustmentReason')
    };

    if (!elements.id || !elements.type || !elements.quantity) {
        alert('Required form elements not found');
        return;
    }

    const productId = parseInt(elements.id.value);
    const adjustmentType = elements.type.value;
    const quantity = parseInt(elements.quantity.value);
    const reason = elements.reason ? elements.reason.value : '';

    if (!productId || !adjustmentType || isNaN(quantity) || quantity < 0) {
        alert('Please fill in all required fields with valid values');
        return;
    }

    const product = inventory.find(p => p.id === productId);
    if (!product) return;

    const oldStock = product.stock;
    
    switch (adjustmentType) {
        case 'add':
            product.stock += quantity;
            break;
        case 'remove':
            product.stock = Math.max(0, product.stock - quantity);
            break;
        case 'set':
            product.stock = quantity;
            break;
    }

    // Log adjustment (in real app, this would go to database)
    console.log(`Stock adjustment: ${product.name} - ${oldStock} → ${product.stock} (${adjustmentType}: ${quantity}) - Reason: ${reason}`);

    // Update display and stats
    applyFiltersAndPagination();
    updateQuickStats();

    // Reset form and close modal
    const form = document.getElementById('stockAdjustmentForm');
    if (form) form.reset();
    
    const stockModal = document.getElementById('stockAdjustmentModal');
    const modal = Modal.getInstance(stockModal);
    if (modal) modal.hide();
    
    showToast(`Stock updated for ${product.name}`, 'success');
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        inventory = inventory.filter(p => p.id !== productId);
        
        // Update filtered inventory and pagination
        applyFiltersAndPagination();
        updateQuickStats();
        
        showToast('Product deleted successfully!', 'info');
    }
}

// Show toast notification
function showToast(message, type) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = '1055';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toastId = 'toast-' + Date.now();
    const toastHtml = `
        <div id="${toastId}" class="toast" role="alert">
            <div class="toast-header bg-${type} text-white">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'danger' ? 'exclamation-circle' : 'info-circle'} me-2"></i>
                <strong class="me-auto">Notification</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast"></button>
            </div>
            <div class="toast-body">
                ${message}
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);
    
    const toastElement = document.getElementById(toastId);
    const toast = new Toast(toastElement, { delay: 5000 });
    toast.show();

    // Remove toast element after it's hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Utility functions for external access
function refreshInventory() {
    applyFiltersAndPagination();
    updateQuickStats();
}

function goToFirstPage() {
    inventoryPagination.firstPage();
}

function updateInventoryCount(newTotal) {
    inventoryPagination.update({ totalItems: newTotal });
}

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing inventory management...');
    initializeInventory();
    attachEventListeners();
});

// Export for potential external use
export { 
    refreshInventory, 
    goToFirstPage, 
    updateInventoryCount, 
    inventoryPagination,
    inventory,
    filteredInventory 
};
