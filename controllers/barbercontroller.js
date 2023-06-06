const User = require('../models/barbermodels/users');
const barberProff = require('../models/barbermodels/barberProf');
const ShopDetails = require('../models/barbermodels/shopDetails');
const time = require('../models/barbermodels/openingTimeSchema');
const price = require('../models/barbermodels/pricing&lang');
const Participation = require('../models/barbermodels/participants');
const fs = require('fs');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const multer = require('multer')

const { validationResult } = require('express-validator');
const { sendVerificationEmail, sendWelcomeEmail, sendPasswordResetEmail }= require( '../mail/mails');

                                        

//========================================== Barber's Registration Start======================================================

exports.register = async (req, res, next) => {
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

    const savedBarber = await user.save();
    const barberId = savedBarber._id.toString();

    await sendVerificationEmail(savedBarber);


    const token = user.getSignedToken(); // Create a token using the getSignedToken method
    res.status(201).json({ message: "User registered successfully", token, barberId });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

//========================================== Barber's Registration Ending =====================================================


//========================================== Barber's Login Start ======================================================

exports.login = async (req, res, next) => {
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

//========================================== Barber's Login Start ======================================================



//========================================== Barber's Forget PSWD/Reset PSWD Start ======================================================

exports.resetPassword = async (req, res, next) => {
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

//========================================== Barber's Forget PSWD/Reset PSWD End ======================================================




//========================================== Barber's Forget & Addig New PSWD Start ======================================================

exports.addNewPswd = async (req, res, next) => {
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

//========================================== Barber's Forget & Addig New PSWD Start ======================================================



// ============================================ Set Braber Profile Api ==========================================================

exports.setProfileDetails = async (req, res, next) => {
  try {
    const { barberId,name, email, number } = req.body;
    const profilePicture = req.file.path;
    
    console.log(barberId)
    const user = await barberProff.create({
      name,
      email,
      number,
      profilePicture,
      barberId
    });

    res.json({ message: "Data inserted successfully", user});
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.setShopDetails = async (req, res, next) => {
  try {
    const { shopName, shopEmail, shopPhone, shopAddress, shopSits, staffMembers, About,barberId } = req.body;
    const shop = await ShopDetails.create({
      shopName,
      shopEmail,
      shopPhone,
      shopAddress,
      shopSits,
      staffMembers,
      About,
      barberId
    });

    res.json({ shop });
  }
  catch (err) {
    console.log(err);
    next(err);
  }
}

exports.setOpenClosetime = async (req, res, next) => {
  try {

    const setTime = await time.create({
      ...req.body
    });

    // console.log(Tuesday)
    res.json({ setTime });
  }
  catch (error) {
    console.log(error)
    next(error)
  }

}

exports.setPricing = async (req, res, next) => {
  try {
    const pricing = await price.create({
      ...req.body
    });
    res.json({ pricing });
  }
  catch (err) {
    console.log(err)
  }
}

// ============================================ Set Braber Profile Api ==========================================================




exports.participateInContest = async (req, res, next) => {
  try {
    const { barberId } = req.body;
    const picture = req.file.path;

    // Check if the barber has already participated
    const existingParticipation = await Participation.findOne({ barberId });
    if (existingParticipation) {
      return res.status(400).json({ message: "Barber has already participated" });
    }

    // Create a new participation record
    const participation = await Participation.create({
      barberId,
      picture,
      votes: 0
    });

    res.status(200).json({ message: "Participation created successfully", participation });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.getParticipants = async (req, res, next) => {
  try {
    const participants = await Participation.find({}, 'picture votes')
      .populate('barberId', 'email');
    res.status(200).json({ participants });
  } catch (error) {
    console.log(error);
    next(error);
  }
};





exports.deleteParticipantPhoto = async (req, res, next) => {
  try {
    const { barberId } = req.params;

    // Find the participation record by barberId
    const participation = await Participation.findOne({ barberId });
    if (!participation) {
      return res.status(404).json({ message: "Participation not found" });
    }

    // Delete the participant's photo
    const photoPath = participation.picture;
    fs.unlink(photoPath, (err) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: "Failed to delete photo" });
      }
      console.log("Photo deleted successfully");
    });

    // Remove the participation record
    await Participation.deleteOne({ barberId });

    res.status(200).json({ message: "Participant photo deleted successfully" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};



exports.blockParticipant = async (req, res, next) => {
  try {
    const { participantId } = req.params;

    // Find the participant by ID
    const participant = await Participation.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    // Block the participant
    participant.isBlocked = true;
    await participant.save();

    res.status(200).json({ message: 'Participant blocked successfully', participant });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

exports.unblockParticipant = async (req, res, next) => {
  try {
    const { participantId } = req.params;

    // Find the participant by ID
    const participant = await Participation.findById(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    // Unblock the participant
    participant.isBlocked = false;
    await participant.save();

    res.status(200).json({ message: 'Participant unblocked successfully', participant });
  } catch (error) {
    console.log(error);
    next(error);
  }
};


exports.deleteParticipant = async (req, res, next) => {
  try {
    const { participantId } = req.params;

    // Find the participant by ID
    const participant = await Participation.findById(participantId);

    // If participant does not exist
    if (!participant) {
      return res.status(404).json({ message: 'Participant not found' });
    }

    // Delete the participant's picture file from the server
    // fs.unlinkSync(participant.picture);

    // Delete the participant from the database
    await Participation.deleteOne({ _id: participantId });

    res.status(200).json({ message: 'Participant deleted successfully' });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

