const mongoose = require('mongoose');

// Define the Rating schema
const ratingSchema = new mongoose.Schema({
  product_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Members',
    required: true
  },
  rating: {
    type: Number,
    required: true,
  },
  feedback: {
    type: String,
  },
  timestamp: {
    type: Date,
    required: true,
  },
});

// Create the Rating model
const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
