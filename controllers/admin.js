const Admin = require("../models/admin_model/admin");
const AdminProf = require("../models/admin_model/adminProfile");
const DigitalStamp = require("../models/membersmodel/digitalStamp");
const BarberProf = require("../models/barbermodels/barberProf");
const User = require("../models/membersmodel/member");
const Barber = require("../models/barbermodels/users");
const BarberProfile = require("../models/barbermodels/barberProf");
const BarberShop = require("../models/barbermodels/shopDetails");
const BarberTime = require("../models/barbermodels/openingTimeSchema");
const BarberPricing = require("../models/barbermodels/pricing&lang");
const Staff = require("../models/admin_model/staff");
const Contest = require("../models/admin_model/contest");
const Participation = require('../models/barbermodels/participants');




// otp and resetemail
const otpmodel=require("../models/admin_model/otp");
const { sendEmailWithOTP, generateOTP } = require("../mail/pswdResetMail");

const Product = require("../models/e_commerce/productSchema");
const Order = require("../models/e_commerce/orderSchema");
const Rating = require("../models/e_commerce/ratingSchema");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const multer = require("multer");
const { DateTime } = require("luxon");
const bcryptjs = require("bcryptjs");

const {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendAddStaffPswd,
} = require("../mail/mails");
const { validationResult } = require("express-validator");
const barber = require("../models/barbermodels/users");

//========================================== Barber's Registration Start======================================================

exports.adminRegister = async (req, res, next) => {
  const { username, email, password, cpassword } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(errors.array());
  }

  try {
    if (password !== cpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await Admin.create({
      username,
      email,
      password,
      cpassword,
    });

    // await sendVerificationEmail(user);

    const token = user.getSignedToken(); // Create a token using the getSignedToken method
    res
      .status(201)
      .json({ message: "User registered successfully", token, user });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//========================================== Barber's Registration Ending =====================================================

//========================================== Barber's Login Start ======================================================

// exports.adminLogin = async (req, res, next) => {
//   const { email, password } = req.body;

//   // Validate input fields
//   const errors = validationResult(req);
//   if (!errors.isEmpty()) {
//     return next(errors.array());
//   }

//   try {
//     const user = await Admin.findOne({ email }).select('+password');
//     if (!user) {
//       return next('Invalid Credentials');
//     }
//     const isMatch = await user.matchPasswords(password);
//     if (!isMatch) {
//       return next('Invalid Credentials');
//     }
//     // await sendWelcomeEmail(user); // Send the welcome email

//     const token = user.getSignedToken(); // Create a token using the getSignedToken method
//     res.status(200).json({ message: 'User logged in Successfully', token, user });
//     res.json(token);

//   } catch (error) {
//     console.log(error);
//     next(error);
//   }
// };

exports.adminLogin = async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input fields
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(errors.array());
  }

  try {
    const user = await Admin.findOne({ email }).select("+password");
    if (!user) {
      return next("Invalid Credentials");
    }
    const isMatch = await user.matchPasswords(password);
    if (!isMatch) {
      return next("Invalid Credentials");
    }

    const role = user.role;

    if (role === "admin") {
      const token = user.getSignedToken();
      return res
        .status(200)
        .json({ message: "Admin logged in successfully", user, token });
    } else if (role === "staff") {
      // Handle staff login logic here
      // ...
      return res
        .status(200)
        .json({ message: "Staff logged in successfully", user });
    } else {
      return next("Invalid Role");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
// Controller method to handle admin password reset
// sendOTP controller
exports.sendOTP = async (req, res, next) => {
  const { email } = req.body;

  try {
    const user = await Admin.findOne({ email });
    if (!user) {
      return next("User not found");
    }

    const otpcode = generateOTP();
    const otpdata = new otpmodel({
      email: req.body.email,
      code: otpcode,
      expireIn: new Date().getTime() + 300 * 1000,
    });

    const otpResponce = await otpdata.save();

    sendEmailWithOTP(email, otpcode);
    res.status(200).json({ message: "OTP sent successfully", email, otpResponce });
  } catch (error) {
    console.log(error);
    next(error);
  }
};


exports.resetAdminPassword = async (req, res, next) => {
  const { code, currentPassword, newPassword, confirmPassword } = req.body;
  const response = {};

  try {
    const otpData = await otpmodel.findOne({ email: req.body.email, code });
    if (!otpData) {
      response.message = "Invalid OTP";
      response.statusText = "error";
      return res.status(400).json(response);
    }

    const currentTime = new Date().getTime();
    if (otpData.expireIn < currentTime) {
      response.message = "Token Expired";
      response.statusText = "error";
      return res.status(400).json(response);
    }

    const user = await Admin.findOne({ email: req.body.email });
    if (!user) {
      response.message = "User not found";
      response.statusText = "error";
      return res.status(400).json(response);
    }

    if (newPassword !== confirmPassword) {
      response.message = "New password and confirm password do not match";
      response.statusText = "error";
      return res.status(400).json(response);
    }

    user.password = newPassword;
    await user.save();

    response.message = "Password changed successfully";
    response.statusText = "success";
    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    next(error);
  }
};




//========================================== Admin's Forget & Addig New PSWD Start ======================================================

// ============================================ Set Admin Profile Api ==========================================================

exports.adminSetProf = async (req, res, next) => {
  try {
    const { name, email, number, adminId } = req.body;
    const profilePicture = req.file.path;

    const profile = await AdminProf.create({
      adminId,
      name,
      email,
      number,
      profilePicture,
    });

    res.json({ message: "Data inserted successfully", profile });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// ============================================ Set Admin Profile Api ==========================================================

// ================================================= Get All Statistics ==========================================================

exports.getActiveBarbers = async (req, res, next) => {
  try {
    const activeBarbersCount = await BarberProf.countDocuments({
      isActive: true,
    });
    res.json({ activeBarbersCount });
    console.log(activeBarbersCount);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.getRegisteredBarbers = async (req, res, next) => {
  try {
    const totalBarberShopsPromise = BarberShop.countDocuments();
    const totalMembersPromise = User.countDocuments();
    const totalParticipantsPromise = Participation.countDocuments();
    const digitalStampCountPromise = DigitalStamp.countDocuments();
    const activeMemberCountPromise = User.countDocuments({ isActive: true });
    const activeBarbersCountPromise = BarberProf.countDocuments({
      isActive: true,
    });

    const [
      totalBarberShops,
      digitalStampCount,
      activeBarbersCount,
      activeMemberCount,
      totalMembers,
      totalParticipants,
    ] = await Promise.all([
      totalBarberShopsPromise,
      digitalStampCountPromise,
      activeBarbersCountPromise,
      activeMemberCountPromise,
      totalMembersPromise,
      totalParticipantsPromise,
    ]);

    res.json({
      totalBarberShops,
      digitalStampCount,
      activeBarbersCount,
      activeMemberCount,
      totalMembers,
      totalParticipants
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.getDigitalStampCount = async (req, res, next) => {
  try {
    const digitalStampCount = await DigitalStamp.countDocuments();
    res.json({ digitalStampCount });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// ================================================= Get All Statistics ==========================================================

// ============================================================== Deletion & Restriction ========================================

exports.getAllMembers = async (req, res, next) => {
  try {
    // Retrieve all members from the User model
    const members = await User.find({}, 'email');

    res.status(200).json({ members });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  let memberId = req.params.memberId;

  memberId = memberId.trim();

  console.log(memberId);

  try {
    const deletedUser = await User.deleteOne({ _id: memberId });

    if (deletedUser.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.deleteBarber = async (req, res, next) => {
  let BarberId = req.params.BarberId;
  BarberId = BarberId.trim();

  try {
    const deletedUser = await Barber.deleteOne({ _id: BarberId });

    if (deletedUser.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the barber's profile as well
    await BarberProfile.deleteOne({ barberId: BarberId });

    await BarberShop.deleteOne({ barberId: BarberId });
    await BarberTime.deleteOne({ barberId: BarberId });
    await BarberPricing.deleteOne({ barberId: BarberId });

    res
      .status(200)
      .json({ message: "Barber and profile deleted successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// Block User======================================== a user by ID========================================================

exports.getAllBarbers = async (req, res, next) => {
  try {
    // Retrieve all barbers from the BarberProfileData model and populate the required fields
    const barbers = await BarberProf.find({}, 'name email profilePicture').populate('barberId', 'email');

    res.status(200).json({ barbers });
  } catch (error) {
    console.log(error);
    next(error);
  }
};




exports.blockBarber = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await Barber.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBlocked = true;
    await user.save();

    return res.status(200).json({ isBlocked: true });
  } catch (error) {
    console.error("Error blocking user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.unblockBarber = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await Barber.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBlocked = false;
    await user.save();

    return res.status(200).json({ isBlocked: false });
  } catch (error) {
    console.error("Error unblocking user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.blockMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBlocked = true;
    await user.save();

    return res.status(200).json({ isBlocked: true });
  } catch (error) {
    console.error("Error blocking user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.unblockMember = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.isBlocked = false;
    await user.save();

    return res.status(200).json({ isBlocked: false });
  } catch (error) {
    console.error("Error unblocking user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//================================================ Get ratings for a specific product =============================================
exports.getRatingPro = async (req, res, next) => {
  try {
    const productRatings = await Rating.find({
      product_id: req.params.product_id,
    });
    res.json(productRatings);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    next(error);
  }
};

//============================================== Get all ratings of a specific product =============================================
exports.getAllRatings = async (req, res) => {
  try {
    const ratings = await Rating.find({ product_id: req.params.product_id });

    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//============================================== Add a new rating for a specific product =============================================
exports.postRatingPro = async (req, res) => {
  const { user_id, rating, feedback } = req.body;

  try {
    const existingRating = await Rating.findOne({
      product_id: req.params.product_id,
      user_id: user_id,
    });

    if (existingRating) {
      return res
        .status(400)
        .json({ error: "User has already rated the product" });
    }

    const newRating = await Rating.create({
      product_id: req.params.product_id,
      user_id,
      rating,
      feedback,
      timestamp: new Date().toISOString(),
    });

    res.status(201).json(newRating);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

//========================================================== contest setting =================================================

exports.contestSet = async (req, res, next) => {
  const { startDate, endDate } = req.body;

  // Validate input data
  if (!startDate || !endDate) {
    return res.status(400).json({ message: "Incomplete contest details" });
  }

  // Convert start and end dates to DateTime objects
  const startDateTime = DateTime.fromISO(startDate);
  const endDateTime = DateTime.fromISO(endDate);

  // Create a new contest instance
  const contest = new Contest({
    startDate: startDateTime.toJSDate(),
    endDate: endDateTime.toJSDate(),
  });

  // Save the contest to the database
  contest
    .save()
    .then(() => {
      res
        .status(201)
        .json({ message: "Contest created successfully", contest });
    })
    .catch((error) => {
      res.status(500).json({ message: "Failed to create contest", error });
    });
};

//============================================================= update contest api ==========================================
exports.contestUpdate = async (req, res, next) => {
  const { id } = req.params;
  const { startDate, endDate } = req.body;

  // Validate input data
  if (!startDate || !endDate) {
    return res.status(400).json({ message: "Incomplete contest details" });
  }

  // Convert start and end dates to DateTime objects
  const startDateTime = DateTime.fromISO(startDate);
  const endDateTime = DateTime.fromISO(endDate);

  // Find and update the contest in the database
  const contest = Contest.findByIdAndUpdate(id, {
    startDate: startDateTime.toJSDate(),
    endDate: endDateTime.toJSDate(),
  })
    .then(() => {
      res
        .status(200)
        .json({ message: "Contest updated successfully", contest });
    })
    .catch((error) => {
      res.status(500).json({ message: "Failed to update contest", error });
      next(error);
    });
};

exports.getContest = async (req, res, next) => {
  try {
    // Retrieve the contest from the database
    const contest = await Contest.findOne();

    // Check if a contest exists
    if (!contest) {
      return res.status(404).json({ message: "No contest found" });
    }

    // Get the current date and time
    const currentDateTime = new Date();

    // Check if the contest has started
    if (currentDateTime < contest.startDate) {
      return res.status(200).json({ message: "Contest has not started yet" });
    }

    // Check if the contest has ended
    if (currentDateTime > contest.endDate) {
      return res.status(200).json({ message: "Contest has already ended" });
    }

    // Calculate the remaining time in milliseconds
    const remainingTime = contest.endDate - currentDateTime;

    // Convert the remaining time to days, hours, and minutes
    const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (remainingTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (remainingTime % (1000 * 60 * 60)) / (1000 * 60)
    );

    // Return the remaining time
    res.status(200).json({ days, hours, minutes });
  } catch (error) {
    res.status(500).json({ message: "Failed to get contest", error });
  }
};

//========================================================== contest setting =================================================

// ====================================================== Add Staff Api =========================================================
exports.addStaff = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if staff email already exists
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({ message: "Staff email already exists" });
    }

    // Create a new staff member
    const staff = new Staff({ email });
    await staff.save();

    // Generate the password reset token for the staff member
    const token = staff.getSignedToken();
    await staff.save();

    // Send the password reset email to the staff member
    await sendAddStaffPswd(staff, token);

    res.status(201).json({ message: "Staff member added successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.setPasswordStaff = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Find the staff member with the given token
    const staff = await Staff.findOne({ resetPasswordToken: token });
    if (!staff) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    // Set the new password
    staff.password = hashedPassword;
    staff.resetPasswordToken = undefined;
    staff.resetPasswordExpire = undefined;
    await staff.save();

    res.status(200).json({ message: "Password set successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
