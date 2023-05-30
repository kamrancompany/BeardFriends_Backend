
const mongoose = require("mongoose");

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

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;