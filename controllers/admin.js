const Admin = require('../models/admin_model/admin');
const DigitalStamp = require('../models/membersmodel/digitalStamp');
const BarberProf = require('../models/barbermodels/barberProf');
const User = require("../models/membersmodel/member");
const Barber = require("../models/barbermodels/users");
const BarberProfile=require('../models/barbermodels/barberProf')
const BarberShop=require('../models/barbermodels/shopDetails')
const BarberTime=require('../models/barbermodels/openingTimeSchema')
const BarberPricing=require('../models/barbermodels/pricing&lang')
const Staff=require('../models/admin_model/staff')
const Contest=require('../models/admin_model/contest')


const Product = require("../models/e_commerce/productSchema");
const Order = require("../models/e_commerce/orderSchema");
const Rating = require("../models/e_commerce/ratingSchema");


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');
const multer = require('multer')
const { DateTime } = require('luxon');

const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail, sendAddStaffPswd }= require( '../mail/mails');
const { validationResult } = require('express-validator');

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
    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//========================================== Barber's Registration Ending =====================================================


//========================================== Barber's Login Start ======================================================

exports.adminLogin = async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input fields
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(errors.array());
  }

  try {
    const user = await Admin.findOne({ email }).select('+password');
    if (!user) {
      return next('Invalid Credentials');
    }
    const isMatch = await user.matchPasswords(password);
    if (!isMatch) {
      return next('Invalid Credentials');
    }
    await sendWelcomeEmail(user); // Send the welcome email

    const token = user.getSignedToken(); // Create a token using the getSignedToken method
    res.status(200).json({ message: 'User logged in Successfully', token });
    res.json(token);

  } catch (error) {
    console.log(error);
    next(error);
  }
};

//========================================== Barber's Login Start ======================================================



//========================================== Barber's Forget PSWD/Reset PSWD Start ======================================================

exports.adminForgetPswd = async (req, res, next) => {
  const { email } = req.body;

  // Validate input fields
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(errors.array());
  }

  try {
    const user = await Admin.findOne({ email });
    if (!user) {
      return next('User not found');
    }

    // Generate a password reset token and save it to the user
    const resetToken = user.getResetPasswordToken();
    console.log(resetToken);
    await user.save();

    // Send the password reset email
    await sendPasswordResetEmail(user);

    res.status(200).json({ message: 'Password reset email sent', resetToken });
    res.json(resetToken);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//========================================== Barber's Forget PSWD/Reset PSWD End ======================================================




//========================================== Barber's Forget & Addig New PSWD Start ======================================================

exports.adminResetPswd = async (req, res, next) => {
  const { password } = req.body;
  const { cpassword } = req.body;
  const { resetToken } = req.params;
  if (!password || !cpassword) {
    res.status(400);
    return next(new Error("Please provide new password"));
  }

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  try {
    const user = await Admin.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400);
      return next(new Error("Invalid Reset Token"));
    }

    user.password = password;
    user.cpassword = cpassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(201).json({
      success: true,
      message: "Password Reset Success",
    });
  } catch (error) {
    next(error);
  }
};

//========================================== Admin's Forget & Addig New PSWD Start ======================================================



// ============================================ Set Admin Profile Api ==========================================================

exports.adminSetProf = async (req, res, next) => {
  try {
    const { name, email, number } = req.body;
    const profilePicture = req.file.path;

    const user = await barberProff.create({
      name,
      email,
      number,
      profilePicture,
    });

    res.json({ message: "Data inserted successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};


// ============================================ Set Admin Profile Api ==========================================================



// ================================================= Get All Statistics ==========================================================

exports.getActiveBarbers = async (req, res, next) => {
  try {
    const activeBarbersCount = await BarberProf.countDocuments({ isActive: true });
    res.json({ activeBarbersCount });
    console.log(activeBarbersCount);
  } catch (error) {
    console.log(error);
    next(error);
  }
};


exports.getRegisteredBarbers = async (req, res, next) => {
  try {
    const totalBarbers = await BarberProf.countDocuments();
    res.json({ totalBarbers });
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

          await BarberShop.deleteOne({barberId: BarberId });
          await BarberTime.deleteOne({barberId: BarberId });
          await BarberPricing.deleteOne({barberId: BarberId });


          res.status(200).json({ message: "Barber and profile deleted successfully" });


      } catch (error) {
        console.log(error);
        next(error);
      }
};




// Restrict======================================== a user by ID========================================================
exports.restrictUser = async (req, res, next) => {
  try {
    const { userId } = req.params;

    // Update the user's status to restricted
    await User.findByIdAndUpdate(userId, { status: "restricted" });

    res.json({ message: "User restricted successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
}






//================================================ Get ratings for a specific product =============================================
exports.getRatingPro= async (req, res,next) => {
  try {
    const productRatings = await Rating.find({ product_id: req.params.product_id });
    res.json(productRatings);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
    next(error)
  }
}


//============================================== Add a new rating for a specific product =============================================
exports.postRatingPro = async (req, res) => {
  const { user_id, rating, feedback } = req.body;

  try {
    const existingRating = await Rating.findOne({
      product_id: req.params.product_id,
      user_id: user_id
    });

    if (existingRating) {
      return res.status(400).json({ error: 'User has already rated the product' });
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
    res.status(500).json({ error: 'Internal Server Error' });
  }
};



//========================================================== contest setting =================================================

exports.contestSet= async(req,res,next)=>{
  const { startDate, endDate } = req.body;

  // Validate input data
  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Incomplete contest details' });
  }

  // Convert start and end dates to DateTime objects
  const startDateTime = DateTime.fromISO(startDate);
  const endDateTime = DateTime.fromISO(endDate);

  // Create a new contest instance
  const contest = new Contest({
    startDate: startDateTime.toJSDate(),
    endDate: endDateTime.toJSDate()
  });

  // Save the contest to the database
  contest.save()
    .then(() => {
      res.status(201).json({ message: 'Contest created successfully',contest });
    })
    .catch((error) => {
      res.status(500).json({ message: 'Failed to create contest', error });
    });
}

//============================================================= update contest api ==========================================
exports.contestUpdate= async(req,res,next)=> {
  const { id } = req.params;
  const { startDate, endDate } = req.body;

  // Validate input data
  if (!startDate || !endDate) {
    return res.status(400).json({ message: 'Incomplete contest details' });
  }

  // Convert start and end dates to DateTime objects
  const startDateTime = DateTime.fromISO(startDate);
  const endDateTime = DateTime.fromISO(endDate);

  // Find and update the contest in the database
 const contest = Contest.findByIdAndUpdate(id, {
    startDate: startDateTime.toJSDate(),
    endDate: endDateTime.toJSDate()
  })
    .then(() => {
      res.status(200).json({ message: 'Contest updated successfully', contest});
    })
    .catch((error) => {
      res.status(500).json({ message: 'Failed to update contest', error });
      next(error)
    });
};

//========================================================== contest setting =================================================

// ====================================================== Add Staff Api =========================================================


exports.addStaff = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Check if staff email already exists
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({ message: 'Staff email already exists' });
    }

    // Create a new staff member
    const staff = new Staff({ email });
    await staff.save();
    
    

    await sendAddStaffPswd(staff);

    const token = staff.getSignedToken(); // Create a token using the getSignedToken method
    res.status(201).json({ message: "User registered successfully",token });

    
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


exports.setPasswordStaff = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    // Find the staff member with the given token
    const staff = await Staff.findOne({ addPasswordToken: token });
    if (!staff) {
      return res.status(400).json({ message: 'Invalid token' });
    }

    // Check if the token has expired
    if (staff.resetPasswordExpire < Date.now()) {
      return res.status(400).json({ message: 'Token has expired' });
    }

    // Set the new password
    staff.password = password;
    staff.addPasswordToken = undefined;
    staff.resetPasswordExpire = undefined;
    await staff.save();

    res.status(200).json({ message: 'Password set successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
