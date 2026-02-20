const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  companyName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  logo: { type: String },
  isApproved: { type: Boolean, default: true },
  vehicles: [{
    name: { type: String },
    type: { type: String },
    capacity: { type: Number },
    priceMultiplier: { type: Number, default: 1 },
    features: [{ type: String }],
  }],
  routes: [{
    from: { type: String },
    to: { type: String },
    basePrice: { type: Number },
    distance: { type: Number },
    estimatedDuration: { type: Number },
  }],
  departureDates: [{
    date: { type: Date },
    time: { type: String },
    routeFrom: { type: String },
    routeTo: { type: String },
    vehicleName: { type: String },
    availableSeats: { type: Number },
  }],
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Partner', partnerSchema);