const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all queue entries
router.get('/', (req, res) => {
    db.all(`SELECT q.*, c.Name as CustomerName, s.ServiceName, st.Name as StaffName 
            FROM Queue q 
            JOIN Customers c ON q.CustomerID = c.CustomerID 
            JOIN Services s ON q.ServiceID = s.ServiceID 
            LEFT JOIN Staff st ON q.StaffID = st.StaffID 
            ORDER BY q.JoinedAt ASC`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get single queue entry
router.get('/:id', (req, res) => {
    db.get(`SELECT q.*, c.Name as CustomerName, s.ServiceName, st.Name as StaffName 
            FROM Queue q 
            JOIN Customers c ON q.CustomerID = c.CustomerID 
            JOIN Services s ON q.ServiceID = s.ServiceID 
            LEFT JOIN Staff st ON q.StaffID = st.StaffID 
            WHERE q.QueueID = ?`, [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Queue entry not found' });
            return;
        }
        res.json(row);
    });
});

// Create queue entry (walk-in)
router.post('/', (req, res) => {
    const { CustomerID, ServiceID, StaffID } = req.body;
    db.run('INSERT INTO Queue (CustomerID, ServiceID, StaffID) VALUES (?, ?, ?)',
        [CustomerID, ServiceID, StaffID || null],
        function(err) {
            if (err) {
                console.error('Queue creation error:', err);
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ QueueID: this.lastID, CustomerID, ServiceID, StaffID: StaffID || null, Status: 'waiting' });
        }
    );
});

// Update queue status (admin only)
router.put('/:id', (req, res) => {
    const { Status, StaffID } = req.body;
    db.run('UPDATE Queue SET Status = ?, StaffID = ? WHERE QueueID = ?',
        [Status, StaffID, req.params.id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Queue updated' });
        }
    );
});

// Delete queue entry (admin only)
router.delete('/:id', (req, res) => {
    db.run('DELETE FROM Queue WHERE QueueID = ?', [req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Queue entry deleted' });
    });
});

module.exports = router;
