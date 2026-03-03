document.addEventListener("DOMContentLoaded", () => {
    const loggedInUser = JSON.parse(localStorage.getItem("user"));

    if (!loggedInUser) {
        alert("You must be logged in to place an order!");
        window.location.href = "../Authentication_Page/Login.html";
        return;
    }

    console.log("Access Granted to:", loggedInUser.username);

    const emailField = document.getElementById("c_email");
    if (emailField) {
        emailField.value = loggedInUser.email || "";
    }
});


let products = []; 
async function loadProductsFromBackend() {
    try {
        const response = await fetch('http://localhost:3000/api/products');
        products = await response.json();
        
        console.log("Data received from server:", products);
        
        initProducts(); 
    } catch (error) {
        console.error("Could not connect to the backend server:", error);
        alert("Server is offline. Please run 'node server.js'");
    }
}

loadProductsFromBackend();

    let cart = {}; 
    let selectedSizes = {}; 

function initProducts() {
    products.forEach(p => {
        const container = document.querySelector(`#${p.cat} table`);
        const row = document.createElement('tr');

        if (p.cat == "cat-5") {
  
            row.innerHTML = `
                <td style="padding: 0; max-width: 220px; height: 326px;">
                    <img src="${p.img}" class="prod-img">
                </td>
                <td style="padding: 0; max-width: 250px;"> 
                    <h2>${p.name}</h2>
                    <h4 id="price-display-${p.id}">Select a Size</h4>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 5px;">
                        <button class="bilao_config" onclick="selectSize(${p.id}, 'Small', ${p.variants.small})">S</button>
                        <button class="bilao_config" onclick="selectSize(${p.id}, 'Medium', ${p.variants.medium})">M</button>
                        <button class="bilao_config" onclick="selectSize(${p.id}, 'Large', ${p.variants.large})">L</button>
                    </div>
                    <br>
                    <div>
                        <button class="btn btn-qty" onclick="adjustTempQty(${p.id}, -1)">-</button>
                        <span id="temp-qty-${p.id}" style="margin: 0 10px;">0</span>
                        <button class="btn btn-qty" onclick="adjustTempQty(${p.id}, 1)">+</button>
                    </div>
                    <br>
                    <button class="btn" onclick="addToOrder(${p.id})">Add to Order</button>
                </td>`;

        } else {
            row.innerHTML = `
                <td style="padding: 0; max-width: 220px; height: 326px;">
                    <img src="${p.img}" class="prod-img">
                </td>
                <td style="padding: 0; max-width: 250px;"> 
                    <h2>${p.name}</h2>
                    <h4>₱ ${p.price.toLocaleString()}</h4>
                    <div>
                        <button class="btn btn-qty" onclick="adjustTempQty(${p.id}, -1)">-</button>
                        <span id="temp-qty-${p.id}" style="margin: 0 10px;">0</span>
                        <button class="btn btn-qty" onclick="adjustTempQty(${p.id}, 1)">+</button>
                    </div>
                    <br>
                    <button class="btn" onclick="addToOrder(${p.id})">Add to Order</button>
                </td>`;
        }
        container.appendChild(row);
    });
}

function selectSize(id, sizeName, price) {
    document.getElementById(`price-display-${id}`).innerText = `₱ ${price.toLocaleString()} (${sizeName})`;
    selectedSizes[id] = { size: sizeName, price: price };
}

function addToOrder(id) {
    const qtySpan = document.getElementById(`temp-qty-${id}`);
    const qtyToAdd = parseInt(qtySpan.innerText);
    if (qtyToAdd === 0) return;

    let product = products.find(p => p.id === id);
    let finalPrice = product.price;
    let finalName = product.name;
    let cartKey = id; 

    if (product.cat === 'cat-5') {
        if (!selectedSizes[id]) {
            alert("Please select a size (Small, Medium, or Large)");
            return;
        }
        finalPrice = selectedSizes[id].price;
        const sizeName = selectedSizes[id].size;
        
        finalName = `${product.name} (${sizeName})`;
        cartKey = `${id}_${sizeName}`; 
    }

    if (cart[cartKey]) {
        cart[cartKey].qty += qtyToAdd;
    } else {
        cart[cartKey] = { 
            id: cartKey, 
            name: finalName,
            price: finalPrice,
            img: product.img,
            qty: qtyToAdd 
        };
    }

    qtySpan.innerText = "0";
    if(product.cat === 'cat-5') {
        selectedSizes[id] = null;
        document.getElementById(`price-display-${id}`).innerText = "Select a Size";
    }
    
    renderOrderTable();
}

    function adjustTempQty(id, change) {
        const span = document.getElementById(`temp-qty-${id}`);
        let val = parseInt(span.innerText);
        val = Math.max(0, val + change); 
        span.innerText = val;
    }

    function updateCartQty(id, change) {
        if (cart[id]) {
            cart[id].qty += change;
            if (cart[id].qty <= 0) {
                delete cart[id]; 
            }
            renderOrderTable();
        }
    }

    function renderOrderTable() {
    const tbody = document.getElementById('orderBody');
    tbody.innerHTML = '';
    let grandTotal = 0;

    for (let id in cart) {
        const item = cart[id];
        const totalItemPrice = item.price * item.qty;
        grandTotal += totalItemPrice;

        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>
                <button class="btn btn-qty" onclick="updateCartQty('${item.id}', 1)">+</button>
                <button class="btn btn-qty" onclick="updateCartQty('${item.id}', -1)">-</button>
            </td>
            <td>${item.qty} pcs.</td>
            <td>
                ${item.name}
                </td>
            <td>₱ ${item.price.toLocaleString()}</td>
            <td>₱ ${totalItemPrice.toLocaleString()}</td>
        `;
        tbody.appendChild(row);
    }

    document.getElementById('grandTotalValue').innerText = `₱ ${grandTotal.toLocaleString()}`;
}

    function confirmOrder() {
        const form = document.getElementById('customerForm');
        if (!form.checkValidity()) {
            alert("Please fill out all required fields (Name, Address, Email).");
            return;
        }
        if (Object.keys(cart).length === 0) {
            alert("Your cart is empty.");
            return;
        }
            
        const customerData = {
            name: document.getElementById('c_name').value,
            address: document.getElementById('c_address').value,
            email: document.getElementById('c_email').value,
            phone_number: document.getElementById('c_phone').value,
            tel_number: document.getElementById('c_tel').value
        };

        const receiptHTML = `
            <div style="font-family: sans-serif; padding: 40px; text-align: center; padding-bottom: 1px;">
                <h1 >Order Confirmation</h1>
                <div style="border: 1px solid #ccc; padding: 20px; max-width: 600px; margin: 0 auto; text-align: left;">
                    <h3>Customer:  <u>${customerData.name}</u></h3>
                    <p>Address: <u>${customerData.address}</u></p>
                    <p>Email: <u>${customerData.email}</u></p>
                    <p>Phone Number: <u>${customerData.phone_number}</u></p>
                    <p>Telephone: <u>${customerData.tel_number}</u></p>
                    <hr>
                    <h3>Order Items:</h3>
                    <ul>
                        ${Object.values(cart).map(item => `<li>${item.name} x ${item.qty} = ₱ ${(item.price * item.qty).toLocaleString()}</li>`).join('')}
                    </ul>
                    <h2 style="text-align: right;">Total: ${document.getElementById('grandTotalValue').innerText}</h2>
                    <h6 style="font-size: 10px; margin:0; position: relative; bottom: 0;">
                        The total does not include the delivery fee. 
                    </h6>
                    <h6 style="font-size: 10px; margin:0; position: relative; bottom: 0;">
                        The restaurant will contact you about the delivery fee via email. 
                    </h6>
                </div>
                <br>
                <center>
                <div id="ord_btns">
                <a class="order_button" href="#" onclick="window.close(); return false" target="_blank">Edit</a>
                <button class="order_button" onclick="finalizePurchase()">Submit Order</button>
                </div>
                </center>
                <style>
                    #ord_btns{
                        gap: 30px;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                    }
                    .order_button{
                        padding: 15px 30px;
                        background-color: #ffc605; 
                        color: black; 
                        border: none; 
                        cursor: pointer; 
                        font-size: 1.2em;
                        text-decoration: none;
                        border-radius: 15px;
                    }
                    .order_button:hover{
                        background-color: black; 
                        color: #ffc605; 
                    }
                </style>
            </div>
        `;
        sessionStorage.setItem("receiptHTML", receiptHTML);

        const userData = JSON.parse(localStorage.getItem("user"));
        const orderDataPayload = {
            user_id: userData.id,
            customer_name: document.getElementById('c_name').value,
            customer_email: userData.email,
            delivery_address: document.getElementById('c_address').value,
            phone_number: document.getElementById('c_phone').value,
            total_amount: parseFloat(document.getElementById('grandTotalValue').innerText.replace(/[^0-9.]/g, '')),
            items: Object.values(cart).map(item => {
              
                const sizeMatch = item.name.match(/\(([^)]+)\)/); 
                
                return {
                    product_id: item.id.toString().split('_')[0], 
                    quantity: item.qty,
                    unit_price: item.price,
                    size: sizeMatch ? sizeMatch[1] : null 
                };
            })
        };
        sessionStorage.setItem("pendingOrder", JSON.stringify(orderDataPayload));

        window.open("Order_Confirmation.html", "_blank");
    }

initProducts();

async function finalizePurchase() {
    const userData = JSON.parse(localStorage.getItem("user"));
    const cartArray = Object.values(cart);


    const orderData = {
        user_id: userData.id,
        customer_name: document.getElementById('c_name').value,
        customer_email: userData.email, 
        delivery_address: document.getElementById('c_address').value,
        phone_number: document.getElementById('c_phone').value,
        total_amount: parseFloat(document.getElementById('grandTotalValue').innerText.replace(/[^0-9.]/g, '')),
        items: cartArray.map(item => ({
            product_id: item.id.toString().split('_')[0], 
            quantity: item.qty,
            unit_price: item.price
        }))
    };

    try {
        const response = await fetch('http://localhost:3000/api/place-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (response.ok) {
            alert("Order #" + result.orderId + " placed successfully!");
            cart = {}; // Clear cart
            sessionStorage.clear();
            window.location.href = "Order_Submission.html";
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Critical Error:", error);
        alert("Cannot connect to server. Check if terminal is running server.js");
    }
}