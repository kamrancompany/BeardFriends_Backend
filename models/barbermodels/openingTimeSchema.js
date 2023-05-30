const mongoose = require("mongoose");

const openingTimeSchema = new mongoose.Schema({
  barberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Barbers',
    required: true
  },
  day: {
    type: String,
    required: true
  },

  Monday: [
    {
      openingTimeMond: {
        type: Date,
      },
      closingTimeMond: {
        type: Date,
      },
    },
  ],

  Tuesday: [
    {
      openingTimeTues: {
        type: Date,
      },
      closingTimeTues: {
        type: Date,
      },
    },
  ],

  Wednesday: [
    {
      openingTimeWed: {
        type: Date,
      },
      closingTimeWed: {
        type: Date,
      },
    },
  ],

  Thrusday: [
    {
      openingTimeThr: {
        type: Date,
      },
      closingTimeThr: {
        type: Date,
      },
    },
  ],

  Friday: [
    {
      openingTimeFri: {
        type: Date,
      },
      closingTimeFri: {
        type: Date,
      },
    },
  ],

  Saturday: [
    {
      openingTimeSat: {
        type: Date,
      },
      closingTimeSat: {
        type: Date,
      },
    },
  ],

  Sunday: [
    {
      openingTimSun: {
        type: Date,
      },
      closingTimeSun: {
        type: Date,
      },
    },
  ]
},
  {
    timestamps: true,
  }
);

const OpeningTime = mongoose.model("OpeningTime&Closing", openingTimeSchema);

module.exports = OpeningTime;
