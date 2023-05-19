const mongoose = require("mongoose");

const openingTimeSchema = new mongoose.Schema(
  {
    days: [
      {
        day: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Days",
        },
        openingTime: {
          type: Date,
          required: true,
        },
        closingTime: {
          type: Date,
          required: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const OpeningTime = mongoose.model("OpeningTime&Closing", openingTimeSchema);

module.exports = OpeningTime;
