const express = require('express');
const router = express.Router();
const db = require('../database');

// Simple login (for demo purposes - in production, use proper authentication)
router.post('/login', (req, res) => {
    const { Username, Password } = req.body;
    db.get('SELECT * FROM Users WHERE Username = ? AND Password = ?', [Username, Password], (err, user) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        // Also fetch customer info if it's a customer
        if (user.Role === 'customer') {
            db.get('SELECT * FROM Customers WHERE UserID = ?', [user.UserID], (err, customer) => {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                res.json({ 
                    UserID: user.UserID, 
                    Username: user.Username, 
                    Role: user.Role,
                    CustomerID: customer ? customer.CustomerID : null,
                    Name: customer ? customer.Name : null,
                    ContactNumber: customer ? customer.ContactNumber : null
                });
            });
        } else {
            res.json({ UserID: user.UserID, Username: user.Username, Role: user.Role });
        }
    });
});

// Signup
router.post('/signup', (req, res) => {
    const { Username, Password, Role } = req.body;
    db.run('INSERT INTO Users (Username, Password, Role) VALUES (?, ?, ?)',
        [Username, Password, Role || 'customer'],
        function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    res.status(400).json({ error: 'Username already exists' });
                    return;
                }
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ UserID: this.lastID, Username, Role: Role || 'customer' });
        }
    );
});

module.exports = router;
