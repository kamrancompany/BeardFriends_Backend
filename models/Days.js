const mongoose = require("mongoose");

const DaysSchema = new mongoose.Schema(
  {
    Monday: [
      {
        openingTime: {
          type: Date,
        },
        closingTime: {
          type: Date,
        },
      },
    ],

    Tuesday: [
        {
          openingTime: {
            type: Date,
          },
          closingTime: {
            type: Date,
          },
        },
      ],

      Wednesday: [
        {
          openingTime: {
            type: Date,
          },
          closingTime: {
            type: Date,
          },
        },
      ],

      Thrusday: [
        {
          openingTime: {
            type: Date,
          },
          closingTime: {
            type: Date,
          },
        },
      ],

      Friday: [
        {
          openingTime: {
            type: Date,
          },
          closingTime: {
            type: Date,
          },
        },
      ],

      Saturday: [
        {
          openingTime: {
            type: Date,
          },
          closingTime: {
            type: Date,
          },
        },
      ],

      Sunday: [
        {
          openingTime: {
            type: Date,
          },
          closingTime: {
            type: Date,
          },
        },
      ],
  },
  {
    timestamps: true,
  }
);

const Days = mongoose.model("Days", DaysSchema);

module.exports = Days;
