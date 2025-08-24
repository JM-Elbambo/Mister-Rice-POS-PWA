import { Modal, Toast } from 'bootstrap';


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
    { id: 15, name: "Calrose Rice 5kg", category: "Regular", barcode: "1234567890137", price: 285.00, stock: 7, minStock: 10 }
];

let filteredInventory = [...inventory];

// Initialize page
function initializeInventory() {
    updateQuickStats();
    displayInventory();
}

function attachEventListeners() {
    // Search and filters
    document.getElementById('searchInventory').addEventListener('input', filterInventory);
    document.getElementById('categoryFilter').addEventListener('change', filterInventory);
    document.getElementById('stockFilter').addEventListener('change', filterInventory);
    document.getElementById('sortBy').addEventListener('change', sortInventory);
    
    // Static buttons
    document.querySelector('[data-action="reset-filters"]').addEventListener('click', resetFilters);
    document.querySelector('[data-action="add-product"]').addEventListener('click', () => {
        new Modal(document.getElementById('addProductModal')).show();
    });
    
    // Modal buttons
    document.querySelector('[data-action="save-new-product"]').addEventListener('click', addNewProduct);
    document.querySelector('[data-action="update-product"]').addEventListener('click', updateProduct);
    document.querySelector('[data-action="process-stock-adjustment"]').addEventListener('click', processStockAdjustment);
    
    // Adjustment type change
    document.getElementById('adjustmentType').addEventListener('change', updateAdjustmentInput);
    
    // Table actions (event delegation for dynamically generated buttons)
    document.getElementById('inventoryTableBody').addEventListener('click', handleTableActions);
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

    document.getElementById('totalProducts').textContent = totalProducts;
    document.getElementById('inStockCount').textContent = inStock;
    document.getElementById('lowStockCount').textContent = lowStock;
    document.getElementById('outOfStockCount').textContent = outOfStock;
}

function getStockStatus(item) {
    if (item.stock === 0) return { text: 'Out of Stock', class: 'danger' };
    if (item.stock <= item.minStock) return { text: 'Low Stock', class: 'warning' };
    return { text: 'In Stock', class: 'success' };
}

// Display inventory in table
function displayInventory() {
    const tbody = document.getElementById('inventoryTableBody');
    
    if (filteredInventory.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-muted">
                    <i class="fas fa-search fa-2x mb-2"></i>
                    <p>No products found matching your criteria</p>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = filteredInventory.map(item => {
        const status = getStockStatus(item);
        return `
            <tr>
                <td>
                    <strong>${item.name}</strong>
                </td>
                <td>
                    <span class="badge bg-secondary">${item.category}</span>
                </td>
                <td>
                    <code>${item.barcode}</code>
                </td>
                <td>
                    <strong>₱${item.price.toFixed(2)}</strong>
                </td>
                <td>
                    <span class="fw-bold">${item.stock}</span>
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
}

// Filter inventory based on search and filters
function filterInventory() {
    const searchTerm = document.getElementById('searchInventory').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const stockFilter = document.getElementById('stockFilter').value;

    filteredInventory = inventory.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm) || 
                            item.barcode.includes(searchTerm);
        const matchesCategory = !categoryFilter || item.category === categoryFilter;
        
        let matchesStock = true;
        if (stockFilter === 'in-stock') matchesStock = item.stock > item.minStock;
        else if (stockFilter === 'low-stock') matchesStock = item.stock > 0 && item.stock <= item.minStock;
        else if (stockFilter === 'out-of-stock') matchesStock = item.stock === 0;

        return matchesSearch && matchesCategory && matchesStock;
    });

    displayInventory();
}

function sortInventory() {
    const sortBy = document.getElementById('sortBy').value;
    
    filteredInventory.sort((a, b) => {
        switch (sortBy) {
            case 'name': return a.name.localeCompare(b.name);
            case 'price': return a.price - b.price;
            case 'stock': return b.stock - a.stock;
            case 'category': return a.category.localeCompare(b.category);
            default: return 0;
        }
    });

    displayInventory();
}

function resetFilters() {
    document.getElementById('searchInventory').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('stockFilter').value = '';
    document.getElementById('sortBy').value = 'name';
    filteredInventory = [...inventory];
    displayInventory();
}

function addNewProduct() {
    const form = document.getElementById('addProductForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const newProduct = {
        id: Math.max(...inventory.map(p => p.id)) + 1,
        name: document.getElementById('newProductName').value,
        category: document.getElementById('newProductCategory').value,
        barcode: document.getElementById('newProductBarcode').value,
        price: parseFloat(document.getElementById('newProductPrice').value),
        stock: parseInt(document.getElementById('newProductStock').value),
        minStock: parseInt(document.getElementById('newProductMinStock').value)
    };

    inventory.push(newProduct);
    filteredInventory = [...inventory];
    updateQuickStats();
    displayInventory();

    // Reset form and close modal
    form.reset();
    Modal.getInstance(document.getElementById('addProductModal')).hide();
    
    showToast('Product added successfully!', 'success');
}

function editProduct(productId) {
    const product = inventory.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('editProductId').value = product.id;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductCategory').value = product.category;
    document.getElementById('editProductBarcode').value = product.barcode;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductMinStock').value = product.minStock;

    new Modal(document.getElementById('editProductModal')).show();
}

function updateProduct() {
    const productId = parseInt(document.getElementById('editProductId').value);
    const product = inventory.find(p => p.id === productId);
    
    if (!product) return;

    product.name = document.getElementById('editProductName').value;
    product.category = document.getElementById('editProductCategory').value;
    product.barcode = document.getElementById('editProductBarcode').value;
    product.price = parseFloat(document.getElementById('editProductPrice').value);
    product.minStock = parseInt(document.getElementById('editProductMinStock').value);

    filteredInventory = [...inventory];
    updateQuickStats();
    displayInventory();

    Modal.getInstance(document.getElementById('editProductModal')).hide();
    showToast('Product updated successfully!', 'success');
}

// Open stock adjustment modal for specific product
function openStockAdjustment(productId) {
    const product = inventory.find(p => p.id === productId);
    if (!product) return;

    document.getElementById('adjustmentProductId').value = product.id;
    document.getElementById('adjustmentProductName').value = product.name;
    document.getElementById('adjustmentType').value = '';
    document.getElementById('adjustmentQuantity').value = '';
    document.getElementById('adjustmentReason').value = '';
    updateCurrentStockInfo();

    new Modal(document.getElementById('stockAdjustmentModal')).show();
}

// Update adjustment input label based on type
function updateAdjustmentInput() {
    const adjustmentType = document.getElementById('adjustmentType').value;
    const label = document.getElementById('adjustmentQuantityLabel');
    const input = document.getElementById('adjustmentQuantity');

    switch (adjustmentType) {
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

// Update current stock info display on  edit page
function updateCurrentStockInfo() {
    const productId = document.getElementById('adjustmentProductId').value;
    const infoDiv = document.getElementById('currentStockInfo');
    
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
    const productId = parseInt(document.getElementById('adjustmentProductId').value);
    const adjustmentType = document.getElementById('adjustmentType').value;
    const quantity = parseInt(document.getElementById('adjustmentQuantity').value);
    const reason = document.getElementById('adjustmentReason').value;

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

    filteredInventory = [...inventory];
    updateQuickStats();
    displayInventory();

    // Reset form and close modal
    document.getElementById('stockAdjustmentForm').reset();
    Modal.getInstance(document.getElementById('stockAdjustmentModal')).hide();
    
    showToast(`Stock updated for ${product.name}`, 'success');
}

function deleteProduct(productId) {
    if (confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
        inventory = inventory.filter(p => p.id !== productId);
        filteredInventory = [...inventory];
        updateQuickStats();
        displayInventory();
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


document.addEventListener('DOMContentLoaded', () => {
    initializeInventory();
    attachEventListeners();
});