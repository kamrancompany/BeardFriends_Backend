const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  ratings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Rating' }],
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  photos: [
    {
      type: String,
      required: true,
    },
  ],
  deliveryCharges: {
    type: Number,
    required: true,
  },
  freeDelivery: {
    type: Boolean,
    default: false,
  },
  stock: {
    type: Number,
    required: true,
  },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;