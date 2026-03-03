document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== 'admin') {
        alert("Restricted Access: Admin use Only.");
        window.location.href = "../Main_Page/index.html";
        return;
    }

    document.getElementById('admin-name').innerText = user.username;
    
    refreshOrders();
});

async function refreshOrders() {
    const tbody = document.getElementById("admin-orders-body");
    tbody.innerHTML = `<tr><td colspan="6" class="text-center">Loading orders...</td></tr>`;

    try {
        const response = await fetch('http://localhost:3000/api/admin/orders');
        const orders = await response.json();

        tbody.innerHTML = ""; 

        if (orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="6" class="text-center">No orders found.</td></tr>`;
            return;
        }

      orders.forEach(order => {
            const date = new Date(order.created_at).toLocaleDateString();
            const row = document.createElement("tr");
            
                row.innerHTML = `
                    <td>#${order.order_id}</td>
                    <td><strong>${order.customer_name}</strong></td>
                    <td><div class="address-cell">${order.delivery_address}</div></td>
                    <td>₱${parseFloat(order.total_amount).toLocaleString()}</td>
                    <td><span class="badge ${getStatusClass(order.status)}">${order.status}</span></td>
                    <td>${date}</td>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <button class="btn btn-view btn-sm" onclick="viewOrderDetails(${order.order_id})">Details</button>
                            
                            <button class="btn btn-outline-danger btn-sm border-0" onclick="deleteOrder(${order.order_id})">
                                <img src="Trash.png" alt="Delete" style="width: 14px; height: 18px;">
                            </button>

                            <select class="form-select form-select-sm w-auto" onchange="updateStatus(${order.order_id}, this.value)">
                                <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                                <option value="Preparing" ${order.status === 'Preparing' ? 'selected' : ''}>Preparing</option>
                                <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                                <option value="Cancelled" ${order.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                            </select>
                        </div>
                    </td>
                `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Fetch error:", error);
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-danger">Error connecting to server.</td></tr>`;
    }
}

function getStatusClass(status) {
    switch (status) {
        case 'Pending': return 'bg-warning text-dark';
        case 'Preparing': return 'bg-info text-dark';
        case 'Delivered': return 'bg-success';
        case 'Cancelled': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

function showSection(sectionId) {

    document.querySelectorAll('.content-block').forEach(block => block.style.display = 'none');
 
    const target = document.getElementById(`${sectionId}-section`);
    if (target) target.style.display = 'flex';


    document.querySelectorAll('.admin-nav .nav-link').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');

 
    if (sectionId === 'orders') refreshOrders();
    if (sectionId === 'products') refreshProducts();
    if (sectionId === 'users') refreshUsers();
}
async function updateStatus(orderId, newStatus) {
    try {
        const response = await fetch('http://localhost:3000/api/admin/update-order-status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orderId, status: newStatus })
        });

        const result = await response.json();
        if (result.success) {
            alert(`Order #${orderId} updated to ${newStatus}`);
            refreshOrders(); // Refresh to update the badge colors
        } else {
            alert("Error updating status.");
        }
    } catch (error) {
        console.error("Update error:", error);
        alert("Failed to connect to the server.");
    }
}

async function viewOrderDetails(orderId) {
    const modalItemsBody = document.getElementById("modal-items-body");
    const modalOrderId = document.getElementById("modal-order-id");
    
    modalOrderId.innerText = orderId;
    modalItemsBody.innerHTML = "<tr><td colspan='5' class='text-center'>Loading...</td></tr>";

    try {
        const response = await fetch(`http://localhost:3000/api/admin/order-items/${orderId}`);
        const items = await response.json();

        modalItemsBody.innerHTML = "";
        
        if (items.length === 0) {
            modalItemsBody.innerHTML = "<tr><td colspan='5' class='text-center'>No items found for this order.</td></tr>";
        } else {
            items.forEach(item => {
                const row = document.createElement("tr");
                const subtotal = item.quantity * item.unit_price;
                
                row.innerHTML = `
                    <td><strong>${item.product_name}</strong></td>
                    <td>${item.quantity}</td>
                    <td><span class="badge bg-secondary">${item.size || 'N/A'}</span></td>
                    <td>₱${parseFloat(item.unit_price).toFixed(2)}</td>
                    <td><strong>₱${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</strong></td>
                `;
                modalItemsBody.appendChild(row);
            });
        }

        const myModal = new bootstrap.Modal(document.getElementById('orderDetailsModal'));
        myModal.show();
    } catch (error) {
        console.error("Fetch Details Error:", error);
        alert("Error loading items. Check console.");
    }
}

async function deleteOrder(orderId) {
    if (!confirm(`⚠️ WARNING: This will permanently delete Order #${orderId}. This cannot be undone. Do you wish to Proceed?`)) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/admin/delete-order/${orderId}`, {
            method: 'DELETE'
        });
        const data = await response.json();

        if (data.success) {
            refreshOrders(); // Reload the table
        } else {
            alert("Error: " + data.message);
        }
    } catch (error) {
        console.error("Delete Error:", error);
        alert("Failed to connect to server.");
    }
}

// PRODUCT MANAGEMENT
async function refreshProducts() {
    const tbody = document.getElementById("admin-products-body");
    tbody.innerHTML = `<tr><td colspan="4" class="text-center">Loading Inventory...</td></tr>`;

   
    const categoryMap = {
        'cat-1': 'Mga Ulam',
        'cat-2': 'Sizzling Meals',
        'cat-3': 'Mga Silog',
        'cat-4': 'Mga Pares',
        'cat-5': 'Mga Bilao',
        'cat-6': 'Extras'
    };

    try {
        const response = await fetch('http://localhost:3000/api/products');
        const products = await response.json();
        
        console.log("Admin side received:", products); 
        tbody.innerHTML = "";

        products.forEach(p => {
            const row = document.createElement("tr");
            
            
            const rawCat = p.cat || "N/A"; 
            const readableCat = categoryMap[rawCat] || rawCat;

            row.innerHTML = `
                <td>#${p.id}</td>
                <td><strong>${p.name}</strong></td>
                <td><span class="badge bg-dark">${readableCat}</span></td>
                <td class="text-success fw-bold">₱${parseFloat(p.price || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        console.error("Product Load Error:", error);
        tbody.innerHTML = `<tr><td colspan="4" class="text-center text-danger">Error loading products.</td></tr>`;
    }
}

//  USER MANAGEMENT 
async function refreshUsers() {
    const tbody = document.getElementById("admin-users-body");
    tbody.innerHTML = `<tr><td colspan="5" class="text-center">Loading Users...</td></tr>`;

    try {
        const response = await fetch('http://localhost:3000/api/admin/users');
        const users = await response.json();
        tbody.innerHTML = "";

        users.forEach(u => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>#${u.id}</td>
                <td><strong>${u.username}</strong></td>
                <td>${u.email}</td>
                <td>
                    <select class="form-select form-select-sm w-auto" onchange="updateUserRole(${u.id}, this.value)">
                        <option value="customer" ${u.role === 'customer' ? 'selected' : ''}>Customer</option>
                        <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>Admin</option>
                    </select>
                </td>
                <td>
                    <button class="btn btn-outline-danger btn-sm border-0" onclick="deleteUser(${u.id})">
                        <img src="Trash.png" alt="Delete" style="width: 14px; height: 18px;">
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error loading users.</td></tr>`;
    }
}

// User role change
async function updateUserRole(userId, newRole) {
    try {
        const response = await fetch('http://localhost:3000/api/admin/update-user-role', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, newRole })
        });
        const result = await response.json();
        if (result.success) {
            alert("Selected user's role has been updated.");
            refreshUsers();
        }
    } catch (error) {
        alert("Failed to update role.");
    }
}

// User deletion
async function deleteUser(userId) {
    if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;

    try {
        const response = await fetch(`http://localhost:3000/api/admin/delete-user/${userId}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (result.success) {
            refreshUsers();
        }
    } catch (error) {
        alert("Failed to delete user.");
    }
}