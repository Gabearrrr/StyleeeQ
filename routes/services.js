const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all services
router.get('/', (req, res) => {
    db.all('SELECT * FROM Services', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get single service
router.get('/:id', (req, res) => {
    db.get('SELECT * FROM Services WHERE ServiceID = ?', [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Service not found' });
            return;
        }
        res.json(row);
    });
});

// Create service (admin only)
router.post('/', (req, res) => {
    const { ServiceName, Price, Duration } = req.body;
    db.run('INSERT INTO Services (ServiceName, Price, Duration) VALUES (?, ?, ?)',
        [ServiceName, Price, Duration],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ ServiceID: this.lastID, ServiceName, Price, Duration });
        }
    );
});

// Update service (admin only)
router.put('/:id', (req, res) => {
    const { ServiceName, Price, Duration } = req.body;
    db.run('UPDATE Services SET ServiceName = ?, Price = ?, Duration = ? WHERE ServiceID = ?',
        [ServiceName, Price, Duration, req.params.id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Service updated' });
        }
    );
});

// Delete service (admin only)
router.delete('/:id', (req, res) => {
    db.run('DELETE FROM Services WHERE ServiceID = ?', [req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Service deleted' });
    });
});

module.exports = router;
