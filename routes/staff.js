const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all staff
router.get('/', (req, res) => {
    db.all('SELECT * FROM Staff', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get single staff
router.get('/:id', (req, res) => {
    db.get('SELECT * FROM Staff WHERE StaffID = ?', [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Staff not found' });
            return;
        }
        res.json(row);
    });
});

// Create staff (admin only)
router.post('/', (req, res) => {
    const { Name, Role, AvailabilityStatus } = req.body;
    db.run('INSERT INTO Staff (Name, Role, AvailabilityStatus) VALUES (?, ?, ?)',
        [Name, Role, AvailabilityStatus || 'available'],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ StaffID: this.lastID, Name, Role, AvailabilityStatus });
        }
    );
});

// Update staff (admin only)
router.put('/:id', (req, res) => {
    const { Name, Role, AvailabilityStatus } = req.body;
    db.run('UPDATE Staff SET Name = ?, Role = ?, AvailabilityStatus = ? WHERE StaffID = ?',
        [Name, Role, AvailabilityStatus, req.params.id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Staff updated' });
        }
    );
});

// Delete staff (admin only)
router.delete('/:id', (req, res) => {
    db.run('DELETE FROM Staff WHERE StaffID = ?', [req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Staff deleted' });
    });
});

module.exports = router;
