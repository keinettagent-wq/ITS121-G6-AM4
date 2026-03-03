document.addEventListener("DOMContentLoaded", () => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
        alert("Please log in to view your orders.");
        window.location.href = "../Authentication_Page/Login.html";
        return;
    }

    document.getElementById('cust-name').innerText = user.username;
    loadMyOrders(user.id);
});

async function loadMyOrders(userId) {
    const tbody = document.getElementById("my-orders-body");
    tbody.innerHTML = `<tr><td colspan="5" class="text-center">Loading your history...</td></tr>`;

    try {
        const response = await fetch(`http://localhost:3000/api/my-orders/${userId}`);
        const orders = await response.json();

        if (orders.length === 0) {
            tbody.innerHTML = `<tr><td colspan="5" class="text-center">You haven't placed any orders yet.</td></tr>`;
            return;
        }

        tbody.innerHTML = "";
        orders.forEach(order => {
            const date = new Date(order.created_at).toLocaleDateString();
            const row = document.createElement("tr");
            
            row.innerHTML = `
                <td>#${order.order_id}</td>
                <td>${date}</td>
                <td>₱${parseFloat(order.total_amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                <td><span class="status-badge ${getStatusStyle(order.status)}">${order.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-outline-primary" onclick="viewDetails(${order.order_id})">Details</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error loading orders.</td></tr>`;
    }
}

async function viewDetails(orderId) {
    const modalItemsBody = document.getElementById("modal-items-body");
    const modalOrderId = document.getElementById("modal-order-id");
    
    modalOrderId.innerText = orderId;
    modalItemsBody.innerHTML = "<tr><td colspan='4' class='text-center'>Loading items...</td></tr>";

    try {
        const response = await fetch(`http://localhost:3000/api/admin/order-items/${orderId}`);
        const items = await response.json();

        modalItemsBody.innerHTML = "";
        
        items.forEach(item => {
            const subtotal = item.quantity * item.unit_price;
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.product_name} ${item.size ? `<small class='text-muted'>(${item.size})</small>` : ''}</td>
                <td>${item.quantity}</td>
                <td>₱${parseFloat(item.unit_price).toFixed(2)}</td>
                <td>₱${subtotal.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
            `;
            modalItemsBody.appendChild(row);
        });

        const detailModal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
        detailModal.show();
    } catch (error) {
        console.error("Detail Error:", error);
        alert("Could not load item details.");
    }
}

function getStatusStyle(status) {
    if (status === 'Pending') return 'bg-warning';
    if (status === 'Preparing') return 'bg-info';
    if (status === 'Delivered') return 'bg-success';
    if (status === 'Cancelled') return 'bg-cancelled'
    return 'bg-secondary';
}