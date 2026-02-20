const express = require('express');
const router = express.Router();
const axios = require('axios');
const Booking = require('../models/Booking');
const { sendBookingConfirmation } = require('../utils/sendEmail');

// Initialize payment
router.post('/initialize', async (req, res) => {
  try {
    const { email, amount, bookingData } = req.body;

    const response = await axios.post(
      'https://api.paystack.co/transaction/initialize',
      {
        email,
        amount: amount * 100, // Paystack uses kobo
        metadata: {
          bookingData: JSON.stringify(bookingData),
        },
        callback_url: 'http://localhost:5173/payment/verify',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({
      authorizationUrl: response.data.data.authorization_url,
      reference: response.data.data.reference,
    });
  } catch (error) {
    console.error('Payment init error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// Verify payment
// Verify payment
router.get('/verify/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    const response = await axios.get(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    const { status, metadata, amount } = response.data.data;

    if (status === 'success') {
      const bookingData = JSON.parse(metadata.bookingData);

      const newBooking = new Booking({
        schoolId: bookingData.schoolId,
        schoolName: bookingData.schoolName,
        companyId: bookingData.companyId,
        companyName: bookingData.companyName,
        userEmail: response.data.data.customer.email,
        vehicleId: bookingData.vehicleId,
        vehicleName: bookingData.vehicleName,
        seats: bookingData.seats,
        route: bookingData.routeTo,
        departureDate: new Date(bookingData.departureDate),
        departureTime: bookingData.departureTime,
        price: amount / 100,
        luggagePhotos: bookingData.luggagePhotos || [],
        paymentStatus: 'paid',
      });

      await newBooking.save();

      // Send confirmation email
try {
  const user = JSON.parse(metadata.bookingData);
  await sendBookingConfirmation(response.data.data.customer.email, newBooking);
} catch (emailError) {
  console.error('Email error:', emailError.message);
  // Don't fail the booking if email fails
}

      res.json({
        success: true,
        message: 'Payment verified and booking saved!',
        booking: newBooking,
      });
    } else {
      res.json({ success: false, message: 'Payment not successful' });
    }
  } catch (error) {
    console.error('Verify error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;