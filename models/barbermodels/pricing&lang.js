const mongoose = require("mongoose");

const PrincingSchema = new mongoose.Schema(
  {
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
