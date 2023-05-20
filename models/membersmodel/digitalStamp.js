const mongoose = require("mongoose");

const digitalStampSchema = mongoose.Schema({
  count: {
    type: Number,
    required: true,
    default: 0,
  },
});

const DigitalStamp = mongoose.model("DigitalStamp", digitalStampSchema);

module.exports = DigitalStamp;
