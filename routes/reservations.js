const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all reservations
router.get('/', (req, res) => {
    db.all(`SELECT r.*, c.Name as CustomerName, c.CustomerID, s.ServiceName, st.Name as StaffName 
            FROM Reservations r 
            JOIN Customers c ON r.CustomerID = c.CustomerID 
            JOIN Services s ON r.ServiceID = s.ServiceID 
            JOIN Staff st ON r.StaffID = st.StaffID`, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get single reservation
router.get('/:id', (req, res) => {
    db.get(`SELECT r.*, c.Name as CustomerName, s.ServiceName, st.Name as StaffName 
            FROM Reservations r 
            JOIN Customers c ON r.CustomerID = c.CustomerID 
            JOIN Services s ON r.ServiceID = s.ServiceID 
            JOIN Staff st ON r.StaffID = st.StaffID 
            WHERE r.ReservationID = ?`, [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        if (!row) {
            res.status(404).json({ error: 'Reservation not found' });
            return;
        }
        res.json(row);
    });
});

// Create reservation
router.post('/', (req, res) => {
    const { CustomerID, ServiceID, StaffID, ScheduleDate, ScheduleTime } = req.body;
    
    // Check for double booking first
    db.get(`SELECT * FROM Reservations 
            WHERE StaffID = ? AND ScheduleDate = ? AND ScheduleTime = ? AND Status != 'cancelled'`,
        [StaffID, ScheduleDate, ScheduleTime],
        (err, existing) => {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            
            if (existing) {
                res.status(409).json({ error: 'This time slot is already booked for this staff member' });
                return;
            }
            
            // Create reservation if no conflict
            db.run('INSERT INTO Reservations (CustomerID, ServiceID, StaffID, ScheduleDate, ScheduleTime) VALUES (?, ?, ?, ?, ?)',
                [CustomerID, ServiceID, StaffID, ScheduleDate, ScheduleTime],
                function(err) {
                    if (err) {
                        res.status(500).json({ error: err.message });
                        return;
                    }
                    res.json({ ReservationID: this.lastID, CustomerID, ServiceID, StaffID, ScheduleDate, ScheduleTime, Status: 'scheduled' });
                }
            );
        }
    );
});

// Update reservation status (admin only)
router.put('/:id', (req, res) => {
    const { Status } = req.body;
    db.run('UPDATE Reservations SET Status = ? WHERE ReservationID = ?',
        [Status, req.params.id],
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
                return;
            }
            res.json({ message: 'Reservation updated' });
        }
    );
});

// Delete reservation (admin only)
router.delete('/:id', (req, res) => {
    db.run('DELETE FROM Reservations WHERE ReservationID = ?', [req.params.id], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({ message: 'Reservation deleted' });
    });
});

module.exports = router;
