const express = require('express');
const router = express.Router();
const { upload } = require('../utils/cloudinary');

// Upload single photo
router.post('/luggage', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({
      url: req.file.path,
      message: 'Photo uploaded successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Upload multiple photos
router.post('/luggage-multiple', upload.array('photos', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }
    const urls = req.files.map(file => file.path);
    res.json({
      urls,
      message: 'Photos uploaded successfully',
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;