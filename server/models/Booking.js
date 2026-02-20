const mongoose = require('mongoose');

const seatSchema = new mongoose.Schema({
  row: { type: Number },
  column: { type: Number },
  type: { type: String },
  price: { type: Number }
}, { _id: false });

const bookingSchema = new mongoose.Schema({
  schoolId: { type: String },
  schoolName: { type: String },
  companyId: { type: String },
  companyName: { type: String },
  userEmail: { type: String },
  vehicleId: { type: String },
  vehicleName: { type: String },
  route: { type: String, required: true },
  departureDate: { type: Date, required: true },
  departureTime: { type: String, required: true },
  seats: [seatSchema],
  price: { type: Number, required: true },
  luggagePhotos: [{ type: String }],
  paymentStatus: { type: String, default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', bookingSchema);