
async function finalizePurchase() {
    const pendingOrder = sessionStorage.getItem("pendingOrder");
    if (!pendingOrder) {
        alert("Order data expired. Please close this and try again.");
        return;
    }

    const orderData = JSON.parse(pendingOrder);

    try {
        const response = await fetch('http://localhost:3000/api/place-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (response.ok) {
            alert("Order #" + result.orderId + " placed successfully!");
            
            if (window.opener) {
                window.opener.location.href = "Order_Submission.html";
            }
            
            sessionStorage.removeItem("pendingOrder");
            sessionStorage.removeItem("receiptHTML");
            window.close(); 
        } else {
            alert("Error: " + result.message);
        }
    } catch (error) {
        console.error("Critical Error:", error);
        alert("Cannot connect to server. Check if terminal is running server.js");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const receiptHTML = sessionStorage.getItem("receiptHTML");
    const container = document.getElementById("receipt-container");

    if (receiptHTML && container) {
        container.innerHTML = receiptHTML;
        console.log("Receipt injected successfully.");
    } else {
        console.error("Failed to find receipt data or container.");
        if (container) {
            container.innerHTML = "<h1>Error: No order data found.</h1>";
        }
    }
});