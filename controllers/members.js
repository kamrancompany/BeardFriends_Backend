const User = require('../models/membersmodel/member');
const DigitalStamp = require('../models/membersmodel/digitalStamp');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const Participation = require('../models/barbermodels/participants');

const nodemailer = require('nodemailer');
const multer = require('multer')

const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail }= require( '../mail/mails');

const { validationResult } = require('express-validator');


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

        const savedMember = await user.save();
        const memberId = savedMember._id.toString();
    
        await sendVerificationEmail(savedMember);
    const token = user.getSignedToken(); // Create a token using the getSignedToken method
    res.status(201).json({ message: "User registered successfully", token,memberId });
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


exports.voteForParticipant = async (req, res, next) => {
  try {
    const { participationId, memberId } = req.body;

    // Find the participation record
    const participation = await Participation.findById(participationId);
    if (!participation) {
      return res.status(404).json({ message: "Participation not found" });
    }

    // Check if the participation is blocked
    if (participation.isBlocked) {
      return res.status(403).json({ message: "Participation is blocked" });
    }

    // Check if the member has already voted for this participation
    if (participation.voters.includes(memberId)) {
      return res.status(400).json({ message: "You have already voted for this participation" });
    }

    // Increment the vote count
    participation.votes += 1;

    // Add the member to the list of voters
    participation.voters.push(memberId);

    // Save the updated participation record
    await participation.save();

    res.status(200).json({ message: "Vote counted successfully", participation });
  } catch (error) {
    console.log(error);
    next(error);
  }
};





exports.getWinnerParticipants = async (req, res, next) => {
  try {
    const limit = req.query.limit || 10; // Number of winners to fetch, default is 10

    const winners = await Participation.findOne()
      .sort({ votes: -1 }) // Sort in descending order of votes
      .limit(parseInt(limit)) // Limit the number of winners to fetch
      .populate('barberId', 'picture email') // Populate barberId with picture and email fields
      .select('picture votes createdAt'); // Select only picture, votes, and createdAt fields

    res.status(200).json({ winners });
  } catch (error) {
    console.log(error);
    next(error);
  }
};


exports.getOlderWinnerParticipants = async (req, res, next) => {
  try {
    const limit = req.query.limit || 10; // Number of winners to fetch, default is 10

    const olderWinners = await Participation.find()
      .sort({ createdAt: 1 }) // Sort in ascending order of createdAt (oldest first)
      .limit(parseInt(limit)) // Limit the number of winners to fetch
      .populate('barberId', 'picture email') // Populate barberId with picture and email fields
      .seelct('picture votes createdAt'); // Select only picture, votes, and createdAt fields

    res.status(200).json({ olderWinners });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

