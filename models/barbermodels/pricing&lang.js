const mongoose = require("mongoose");

const PrincingSchema = new mongoose.Schema(
  {
    barberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Barbers',
      required: true
    },
    price: {
        type: Number,
        required: true,
      },
      name: {
        type: String,
        required: true,
      },
      language: {
        type: String,
        required: true,
      },

  }
 
);

const price = mongoose.model("Pric&Lang", PrincingSchema);

module.exports = price;
