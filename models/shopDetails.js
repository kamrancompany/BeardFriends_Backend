const mongoose = require("mongoose");

const shopDetailsSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: [true, "Please provide a shop name"],
    },
    shopEmail: {
      type: String,
      required: [true, "Please provide a shop email"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email",
      ],
    },
    shopPhone: {
      type: String,
      required: [true, "Please provide a shop phone"],
    },
    shopAddress: {
      type: String,
      required: [true, "Please provide a shop address"],
    },
    shopSits: {
      type: Number,
      required: [true, "Please provide the number of shop sits"],
    },
    staffMembers: {
      type: Number,
      required: [true, "Please provide the number of staff members"],
    },
    About: {
      type: String,
      required: [true, "Please provide some information about the shop"],
    },
  },
  {
    timestamps: true,
  }
);

const ShopDetails = mongoose.model("ShopDetails", shopDetailsSchema);

module.exports = ShopDetails;
