const express = require('express');
const mysql = require('mysql2'); 
const cors = require('cors');

const app = express();
const PORT = 3000;

// Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'restaurant_db'
});

app.use(cors());
app.use(express.json());

// Products
app.get('/api/products', (req, res) => {
    db.query("SELECT * FROM products", (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: err.message });
        }
        
        const processedRows = rows.map(row => ({
            ...row,
            variants: typeof row.variants === 'string' ? JSON.parse(row.variants) : row.variants
        }));
        
        res.json(processedRows);
    });
});

// Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const sql = "SELECT * FROM users WHERE username = ? AND password = ?";
    
    db.query(sql, [username, password], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Server error" });
        }

        if (results.length > 0) {
            const user = results[0];
            res.json({
                success: true,
                message: "Login successful!",
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email, 
                    role: user.role,
                    password: user.password
                }
            });
        } else {
            res.json({ success: false, message: "Invalid username or password" });
        }
    });
});

//Register
app.post('/api/register', (req, res) => {
    const { username, email, password } = req.body;
    const role = 'customer'; 

    const sql = "INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)";
    
    db.query(sql, [username, email, password, role], (err, result) => {
        if (err) {
            if (err.code === 'ER_DUP_ENTRY') {
                return res.json({ success: false, message: "Username or Email already taken!" });
            }
            return res.status(500).json({ success: false, message: "Runtime Error, Try Again" });
        }
        res.json({ success: true, message: "Account Successfully Created!" });
    });
});

// Change Password
app.post('/api/change-password', (req, res) => {
    const { username, currentPassword, newPassword } = req.body;

    const checkSql = "SELECT * FROM users WHERE username = ? AND password = ?";
    db.query(checkSql, [username, currentPassword], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ success: false, message: "Database error." });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: "Current password is incorrect." });
        }

        const updateSql = "UPDATE users SET password = ? WHERE username = ?";
        db.query(updateSql, [newPassword, username], (updateErr, updateResult) => {
            if (updateErr) {
                console.error("Update error:", updateErr);
                return res.status(500).json({ success: false, message: "Failed to update password." });
            }

            res.json({ success: true, message: "Password updated successfully!" });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server host: http://localhost:${PORT}`);
    console.log(`Website database is now active`);
});

//order

app.post('/api/place-order', async (req, res) => {
    const { user_id, customer_name, customer_email, delivery_address, phone_number, total_amount, items } = req.body;

    const orderQuery = `INSERT INTO orders (user_id, customer_name, customer_email, delivery_address, phone_number, total_amount) 
                        VALUES (?, ?, ?, ?, ?, ?)`;

    db.query(orderQuery, [user_id, customer_name, customer_email, delivery_address, phone_number, total_amount], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Error saving order header");
        }

        const newOrderId = result.insertId;

        const itemValues = items.map(item => [
            newOrderId, 
            item.product_id, 
            item.quantity, 
            item.unit_price,
            item.size 
        ]);

    
        const itemsQuery = `INSERT INTO order_items (order_id, product_id, quantity, unit_price, size) VALUES ?`;

        db.query(itemsQuery, [itemValues], (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send("Error saving order items");
            }
            res.status(200).json({ message: "Order placed successfully!", orderId: newOrderId });
        });
    });
});

app.get('/api/admin/orders', (req, res) => {
    const sql = "SELECT * FROM orders ORDER BY created_at DESC"; 
    db.query(sql, (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to fetch orders" });
        }
        res.json(rows);
    });
});

// Update Order Status

app.post('/api/admin/update-order-status', (req, res) => {
    const { orderId, status } = req.body;
    
    const sql = "UPDATE orders SET status = ? WHERE order_id = ?";

    db.query(sql, [status, orderId], (err, result) => {
        if (err) {
            console.error("Update Error:", err);
            return res.status(500).json({ success: false, message: "Failed to update status" });
        }
        res.json({ success: true, message: "Status updated successfully!" });
    });
});
// Get items for a specific order
app.get('/api/admin/order-items/:orderId', (req, res) => {
    const { orderId } = req.params;
    
    const sql = `
        SELECT oi.*, p.name AS product_name 
        FROM order_items oi 
        JOIN products p ON oi.product_id = p.id 
        WHERE oi.order_id = ?`;

    db.query(sql, [orderId], (err, rows) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Failed to fetch items" });
        }
        res.json(rows);
    });
});

// Delete Order and its Items
app.delete('/api/admin/delete-order/:orderId', (req, res) => {
    const { orderId } = req.params;

    
    const deleteItemsSql = "DELETE FROM order_items WHERE order_id = ?";
    
    db.query(deleteItemsSql, [orderId], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: "Failed to delete order items" });
        }

        const deleteOrderSql = "DELETE FROM orders WHERE order_id = ?";
        db.query(deleteOrderSql, [orderId], (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ success: false, message: "Failed to delete order header" });
            }
            res.json({ success: true, message: "Order permanently removed" });
        });
    });
});

app.get('/api/admin/users', (req, res) => {
    db.query("SELECT id, username, email, role FROM users", (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.delete('/api/admin/delete-user/:id', (req, res) => {
    const userId = req.params.id;

    const deleteItemsSql = `
        DELETE oi FROM order_items oi
        JOIN orders o ON oi.order_id = o.order_id
        WHERE o.user_id = ?`;

    db.query(deleteItemsSql, [userId], (err) => {
        if (err) {
            console.error("Error deleting order items:", err);
            return res.status(500).json({ success: false, message: "Failed to clear order items." });
        }

        const deleteOrdersSql = "DELETE FROM orders WHERE user_id = ?";
        db.query(deleteOrdersSql, [userId], (err) => {
            if (err) {
                console.error("Error deleting orders:", err);
                return res.status(500).json({ success: false, message: "Failed to clear user orders." });
            }

            
            const deleteUserSql = "DELETE FROM users WHERE id = ?";
            db.query(deleteUserSql, [userId], (err, result) => {
                if (err) {
                    console.error("Error deleting user:", err);
                    return res.status(500).json({ success: false, message: "Failed to delete user account." });
                }

                res.json({ success: true, message: "User and all related data deleted successfully!" });
            });
        });
    });
});

app.post('/api/admin/update-user-role', (req, res) => {
    const { userId, newRole } = req.body;
    db.query("UPDATE users SET role = ? WHERE id = ?", [newRole, userId], (err, result) => {
        if (err) return res.status(500).json({ success: false, message: err.message });
        res.json({ success: true, message: "Role updated successfully" });
    });
});

/* My Orders */

app.get('/api/my-orders/:userId', (req, res) => {
    const { userId } = req.params;
    
  
    const sql = "SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC";
    
    db.query(sql, [userId], (err, rows) => {
        if (err) {
            console.error("Database Error:", err);
            return res.status(500).json({ error: "Failed to retrieve your orders" });
        }
        res.json(rows);
    });
});