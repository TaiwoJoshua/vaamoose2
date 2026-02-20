const express = require('express');
const router = express.Router();
const Partner = require('../models/Partner');

const verifyAdmin = (req, res, next) => {
  const adminKey = req.headers['x-admin-key'];
  if (adminKey !== process.env.ADMIN_SECRET_KEY) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  next();
};

// GET all partners
router.get('/partners', verifyAdmin, async (req, res) => {
  try {
    const partners = await Partner.find().select('-password').sort({ createdAt: -1 });
    res.json({ partners });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// APPROVE partner
router.put('/partners/:id/approve', verifyAdmin, async (req, res) => {
  try {
    const partner = await Partner.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    res.json({ message: 'Partner approved!', partner });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE partner
router.delete('/partners/:id', verifyAdmin, async (req, res) => {
  try {
    await Partner.findByIdAndDelete(req.params.id);
    res.json({ message: 'Partner removed.' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;