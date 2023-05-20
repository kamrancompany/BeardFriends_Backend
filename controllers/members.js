const User = require('../models/membersmodel/member');
const DigitalStamp = require('../models/membersmodel/digitalStamp');
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

                                        

//========================================== Member's Registration Start======================================================

exports.registerMember = async (req, res, next) => {
  const { username, email, password, cpassword } = req.body;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(errors.array());
  }

  try {
    if (password !== cpassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const user = await User.create({
      username,
      email,
      password,
      cpassword,
    });
        // Assign a digital stamp to the member
        const digitalStamp = await DigitalStamp.create({});
        user.assignedDigitalStamp = digitalStamp._id;
        await user.save();
    await sendVerificationEmail(user);

    const token = user.getSignedToken(); // Create a token using the getSignedToken method
    res.status(201).json({ message: "User registered successfully", token });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//========================================== Member's Registration Ending =====================================================


//========================================== Member's Login Start ======================================================

exports.loginMember = async (req, res, next) => {
  const { email, password } = req.body;

  // Validate input fields
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(errors.array());
  }

  try {
    const user = await User.findOne({ email }).select('+password');
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

//========================================== Member's Login Start ======================================================



//========================================== Member's Forget PSWD/Reset PSWD Start ======================================================

exports.forgetPassMember = async (req, res, next) => {
  const { email } = req.body;

  // Validate input fields
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(errors.array());
  }

  try {
    const user = await User.findOne({ email });
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

//========================================== Member's Forget PSWD/Reset PSWD End ======================================================




//========================================== Member's Forget & Addig New PSWD Start ======================================================

exports.addNewPswdMember = async (req, res, next) => {
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
    const user = await User.findOne({
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

//========================================== Member's Forget & Addig New PSWD Start ======================================================

