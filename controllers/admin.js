const Admin = require('../models/admin_model/admin');
const DigitalStamp = require('../models/membersmodel/digitalStamp');
const BarberProf = require('../models/barbermodels/barberProf');

const Product = require("../models/e_commerce/productSchema");
const Order = require("../models/e_commerce/orderSchema");


const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const multer = require('multer')

const { validationResult } = require('express-validator');


// =========================================Verfication Email =========================================================

const sendVerificationEmail = async (user) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'sean.witting@ethereal.email',
      pass: 'HXq4K4rbAFrzteKRbU'
    }
  });

  const verificationLink = `https://yourwebsite.com/verify?token=${user.token}`;

  const mailOptions = {
    from: 'Suleman <sean.witting@ethereal.email>',
    to: 'sallumia9090@gmail.com',
    subject: 'Account Verification',
    text: `Please click the following link to verify your account: ${verificationLink}`,
  };

  await transporter.sendMail(mailOptions);
};

// =========================================Verfication Email =========================================================




//====================================== Function to send welcome email================================================

const sendWelcomeEmail = async (user) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'sean.witting@ethereal.email',
      pass: 'HXq4K4rbAFrzteKRbU'
    }
  });

  // Prepare the email content
  const mailOptions = {
    from: '<sean.witting@ethereal.email>',
    to: user.email,
    subject: 'Welcome to Your Website',
    text: `Welcome to Your Website Mister ${user.username}! We are excited to have you on board.`,
  };

  await transporter.sendMail(mailOptions);
};

//====================================== Function to send welcome email================================================



//======================================Function to send password reset email==========================================


const sendPasswordResetEmail = async (user) => {
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: 'sean.witting@ethereal.email',
      pass: 'HXq4K4rbAFrzteKRbU'
    }
  });

  const resetToken = user.getResetPasswordToken(); // Generate a password reset token
  const resetLink = ` <a href="http://localhost:3000/#/newpswd">http://localhost:3000/#//${resetToken}</a>`;

  const mailOptions = {
    from: '<sean.witting@ethereal.email>',
    to: user.email,
    subject: 'Password Reset',
    text: `Please click the following link to reset your password`,
    html: ` <a href="http://localhost:3000/#/newpswd">http://localhost:3000/#/resetpswd/${resetLink}</a>`
  };

  await transporter.sendMail(mailOptions);
};

//====================================== Function to send password reset email ==========================================

                                        

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

    await sendVerificationEmail(user);

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




// ============================================================Get all products Api's====================================================
exports.getAllProducts = async (req, res, next) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// ================================================ Add a new product================================================
exports.addProduct = async (req, res, next) => {
  try {
    const { name, description, price } = req.body;
    const photos = req.files.map(file => file.path);

    const product = await Product.create({
      name,
      description,
      price,
      photos,
    });

    console.log(product);
    res.status(201).json({ message: "Product added successfully", product });
  } catch (error) {
    console.log(error);
    next(error);
  }
};


//============================================== Get all orders (grouped by year, month, day)=========================================
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" },
          },
          count: { $sum: 1 },
        },
      },
    ]);
    res.json(orders);
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// ===================================================== Get current orders =================================================
exports.getCurrentOrders = async (req, res, next) => {
  try {
    const currentDate = new Date();
    const orders = await Order.find({ date: { $gte: currentDate } });
    res.json(orders);
  } catch (error) {
    console.log(error);
    next(error);
  }
};
