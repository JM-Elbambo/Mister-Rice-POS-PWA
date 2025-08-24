// --- Transactions Data (static for now, can be replaced with dynamic data) ---
const transactionsData = [
    {
        id: '#TXN-2024-001',
        date: 'Aug 25, 2025',
        time: '2:34 PM',
        items: [
            { name: 'Jasmine Rice (5kg)', qty: 2 },
            { name: 'Brown Rice (10kg)', qty: 1 },
            { name: '+ 1 more item', isMore: true }
        ],
        totalItems: 4,
        amount: '₱2,150.00',
        status: 'Completed',
        statusClass: 'success',
        actions: [
            { label: 'View Details', icon: 'fa-eye', id: 'viewDetails-TXN-2024-001' },
            { label: 'Print Receipt', icon: 'fa-print', id: 'printReceipt-TXN-2024-001' },
            { divider: true },
            { label: 'Refund', icon: 'fa-undo', id: 'refund-TXN-2024-001', danger: true }
        ]
    },
    {
        id: '#TXN-2024-002',
        date: 'Aug 25, 2025',
        time: '1:45 PM',
        items: [
            { name: 'White Rice (25kg)', qty: 1 }
        ],
        totalItems: 1,
        amount: '₱1,200.00',
        status: 'Completed',
        statusClass: 'success',
        actions: [
            { label: 'View Details', icon: 'fa-eye', id: 'viewDetails-TXN-2024-002' },
            { label: 'Print Receipt', icon: 'fa-print', id: 'printReceipt-TXN-2024-002' },
            { divider: true },
            { label: 'Refund', icon: 'fa-undo', id: 'refund-TXN-2024-002', danger: true }
        ]
    },
    {
        id: '#TXN-2024-003',
        date: 'Aug 25, 2025',
        time: '12:15 PM',
        items: [
            { name: 'Basmati Rice (5kg)', qty: 2 },
            { name: 'Jasmine Rice (10kg)', qty: 1 },
            { name: 'Brown Rice (5kg)', qty: 3 },
            { name: '+ 2 more items', isMore: true }
        ],
        totalItems: 8,
        amount: '₱4,750.00',
        status: 'Completed',
        statusClass: 'success',
        actions: [
            { label: 'View Details', icon: 'fa-eye', id: 'viewDetails-TXN-2024-003' },
            { label: 'Print Receipt', icon: 'fa-print', id: 'printReceipt-TXN-2024-003' },
            { divider: true },
            { label: 'Refund', icon: 'fa-undo', id: 'refund-TXN-2024-003', danger: true }
        ]
    },
    {
        id: '#TXN-2024-004',
        date: 'Aug 24, 2025',
        time: '6:20 PM',
        items: [
            { name: 'Premium Rice (20kg)', qty: 1 },
            { name: 'Organic Rice (5kg)', qty: 2 }
        ],
        totalItems: 3,
        amount: '₱1,850.00',
        status: 'Refunded',
        statusClass: 'danger',
        actions: [
            { label: 'View Details', icon: 'fa-eye', id: 'viewDetails-TXN-2024-004' },
            { label: 'View Refund', icon: 'fa-file-alt', id: 'viewRefund-TXN-2024-004' }
        ]
    }
];

// --- Pagination Variables ---
const rowsPerPage = 2;
let currentPage = 1;
let filteredData = [...transactionsData];

// --- Render Table Rows ---
function renderTable(page = 1) {
    const tbody = document.getElementById('transactionsTableBody');
    tbody.innerHTML = '';
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const pageData = filteredData.slice(start, end);

    pageData.forEach(txn => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><span class="fw-medium">${txn.id}</span></td>
            <td><div><div>${txn.date}</div><small class="text-muted">${txn.time}</small></div></td>
            <td>
                <div>
                    ${txn.items.map(item => item.isMore ? `<small class='text-muted'>${item.name}</small>` : `<div>${item.name} <span class='text-muted'>x${item.qty}</span></div>`).join('')}
                </div>
            </td>
            <td><span class="badge bg-secondary">${txn.totalItems} item${txn.totalItems > 1 ? 's' : ''}</span></td>
            <td class="fw-bold text-${txn.statusClass === 'danger' ? 'danger' : 'success'}">${txn.amount}</td>
            <td><span class="badge bg-${txn.statusClass}">${txn.status}</span></td>
            <td>
                <div class="dropdown">
                    <button class="btn btn-sm btn-outline-secondary" type="button" data-bs-toggle="dropdown">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <ul class="dropdown-menu">
                        ${txn.actions.map(action => action.divider ? '<li><hr class="dropdown-divider"></li>' : `<li><a class="dropdown-item${action.danger ? ' text-danger' : ''}" id="${action.id}"><i class="fas ${action.icon} me-2"></i>${action.label}</a></li>`).join('')}
                    </ul>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
    renderTableInfo(start, Math.min(end, filteredData.length), filteredData.length);
}

// --- Render Pagination ---
function renderPagination() {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    if (totalPages <= 1) return;

    // Prev button
    const prevLi = document.createElement('li');
    prevLi.className = 'page-item' + (currentPage === 1 ? ' disabled' : '');
    prevLi.innerHTML = `<a class="page-link" href="#">&laquo;</a>`;
    prevLi.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            renderTable(currentPage);
            renderPagination();
        }
    });
    pagination.appendChild(prevLi);

    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = 'page-item' + (i === currentPage ? ' active' : '');
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.addEventListener('click', function(e) {
            e.preventDefault();
            currentPage = i;
            renderTable(currentPage);
            renderPagination();
        });
        pagination.appendChild(li);
    }

    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = 'page-item' + (currentPage === totalPages ? ' disabled' : '');
    nextLi.innerHTML = `<a class="page-link" href="#">&raquo;</a>`;
    nextLi.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            renderTable(currentPage);
            renderPagination();
        }
    });
    pagination.appendChild(nextLi);
}

// --- Render Table Info (showing how many records are displayed) ---
function renderTableInfo(start, end, total) {
    const info = document.getElementById('tableInfo');
    info.textContent = `Showing ${start + 1} to ${end} of ${total} records`;
}

// --- Initial Render ---
renderTable(currentPage);
renderPagination();

// --- (Optional) Filtering and Search can be integrated with pagination ---
// Example: If you want to filter, update filteredData and reset currentPage, then call renderTable(1) and renderPagination()