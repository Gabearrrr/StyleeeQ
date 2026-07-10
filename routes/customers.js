const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all customers
router.get('/', (req, res) => {
    db.all('SELECT * FROM Customers', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get single customer
router.get('/:id', (req, res) => {
    db.get('SELECT * FROM Customers WHERE CustomerID = ?', [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Customer not found' });
            return;
        }
        res.json(row);
    });
});

// Create customer
router.post('/', (req, res) => {
    const { Name, ContactNumber, CustomerType, UserID } = req.body;
    db.run('INSERT INTO Customers (Name, ContactNumber, CustomerType, UserID) VALUES (?, ?, ?, ?)',
        [Name, ContactNumber, CustomerType || 'new', UserID || null],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ CustomerID: this.lastID, Name, ContactNumber, CustomerType, UserID });
        }
    );
});

// Update customer (admin only)
router.put('/:id', (req, res) => {
    const { Name, ContactNumber, CustomerType } = req.body;
    db.run('UPDATE Customers SET Name = ?, ContactNumber = ?, CustomerType = ? WHERE CustomerID = ?',
        [Name, ContactNumber, CustomerType, req.params.id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Customer updated' });
        }
    );
});

// Delete customer (admin only)
router.delete('/:id', (req, res) => {
    db.run('DELETE FROM Customers WHERE CustomerID = ?', [req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Customer deleted' });
    });
});

module.exports = router;
