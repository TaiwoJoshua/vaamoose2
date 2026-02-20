const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Partner = require('../models/Partner');
const Booking = require('../models/Booking');

// Middleware to verify partner token
const verifyPartner = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.partnerId = decoded.partnerId;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { companyName, email, password, phone, address } = req.body;

    const existing = await Partner.findOne({ email });
    if (existing) return res.status(400).json({ error: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const partner = new Partner({ companyName, email, password: hashedPassword, phone, address });
    await partner.save();

    const token = jwt.sign({ partnerId: partner._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, partner: { id: partner._id, companyName: partner.companyName, email: partner.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const partner = await Partner.findOne({ email });
    if (!partner) return res.status(400).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, partner.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ partnerId: partner._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, partner: { id: partner._id, companyName: partner.companyName, email: partner.email } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET partner dashboard data
router.get('/dashboard', verifyPartner, async (req, res) => {
  try {
    const partner = await Partner.findById(req.partnerId);
    const bookings = await Booking.find({ companyId: req.partnerId });
    const earnings = bookings.reduce((sum, b) => sum + (b.price || 0), 0);
    res.json({ partner, bookings, earnings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ADD vehicle
router.post('/vehicles', verifyPartner, async (req, res) => {
  try {
    const partner = await Partner.findById(req.partnerId);
    partner.vehicles.push(req.body);
    await partner.save();
    res.json({ message: 'Vehicle added', vehicles: partner.vehicles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ADD route
router.post('/routes', verifyPartner, async (req, res) => {
  try {
    const partner = await Partner.findById(req.partnerId);
    partner.routes.push(req.body);
    await partner.save();
    res.json({ message: 'Route added', routes: partner.routes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ADD departure date
router.post('/departures', verifyPartner, async (req, res) => {
  try {
    const partner = await Partner.findById(req.partnerId);
    partner.departureDates.push(req.body);
    await partner.save();
    res.json({ message: 'Departure date added', departureDates: partner.departureDates });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET all bookings for partner (with student details)
router.get('/bookings', verifyPartner, async (req, res) => {
  try {
    const bookings = await Booking.find({ companyId: req.partnerId });
    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUBLIC - Get all partners (for students to see)
router.get('/public', async (req, res) => {
  try {
    const partners = await Partner.find({ isApproved: true })
      .select('-password'); // never send password
    res.json({ partners });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUBLIC - Get all available departure dates for students
router.get('/departures', async (req, res) => {
  try {
    const { from, to, date } = req.query;
    
    const partners = await Partner.find({ isApproved: true }).select('-password');
    
    let allDepartures = [];
    
    partners.forEach(partner => {
      partner.departureDates.forEach(dep => {
        allDepartures.push({
          partnerId: partner._id,
          partnerName: partner.companyName,
          partnerPhone: partner.phone,
          ...dep.toObject(),
        });
      });
    });

    // Filter by from
    if (from) {
      allDepartures = allDepartures.filter(d => 
        d.routeFrom.toLowerCase().includes(from.toLowerCase())
      );
    }

    // Filter by to
    if (to) {
      allDepartures = allDepartures.filter(d => 
        d.routeTo.toLowerCase().includes(to.toLowerCase())
      );
    }

    // Filter by date
    if (date) {
      allDepartures = allDepartures.filter(d => {
        const depDate = new Date(d.date).toLocaleDateString();
        const searchDate = new Date(date).toLocaleDateString();
        return depDate === searchDate;
      });
    }

    res.json({ departures: allDepartures });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
module.exports = router;