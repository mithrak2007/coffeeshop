const express = require('express');
const router = express.Router();
const Reservation = require('../models/Reservation');
const { protect, adminOnly } = require('../middleware/auth');

// POST /api/reservations - Create reservation (public or logged in)
router.post('/', async (req, res) => {
  try {
    const reservationData = { ...req.body };

    // Check for date conflicts (max 10 tables per time slot)
    const existingCount = await Reservation.countDocuments({
      date: new Date(req.body.date),
      time: req.body.time,
      status: { $in: ['pending', 'confirmed'] }
    });

    if (existingCount >= 10) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is fully booked. Please choose another time.'
      });
    }

    // Assign a table number
    reservationData.tableNumber = existingCount + 1;

    const reservation = await Reservation.create(reservationData);
    res.status(201).json({
      success: true,
      message: 'Table reserved successfully! We look forward to seeing you.',
      data: reservation
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/reservations - Get all reservations (admin only)
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const { status, date } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (date) filter.date = { $gte: new Date(date), $lt: new Date(new Date(date).setDate(new Date(date).getDate() + 1)) };

    const reservations = await Reservation.find(filter).sort({ date: 1, time: 1 });
    res.json({ success: true, count: reservations.length, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reservations/my - Get current user's reservations
router.get('/my', protect, async (req, res) => {
  try {
    const reservations = await Reservation.find({ email: req.user.email }).sort({ date: -1 });
    res.json({ success: true, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/reservations/:id - Get single reservation
router.get('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
    res.json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/reservations/:id - Update reservation
router.put('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
    res.json({ success: true, message: 'Reservation updated successfully', data: reservation });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// DELETE /api/reservations/:id - Cancel/delete reservation
router.delete('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
    res.json({ success: true, message: 'Reservation cancelled successfully', data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
