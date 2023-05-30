
// =========================================Verfication Email =========================================================
const nodemailer = require('nodemailer');

 exports.sendVerificationEmail = async (user) => {
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'henderson.jast13@ethereal.email',
        pass: 'gNa5b3gUEuZMr9fFZ4'
      }
    });
  
    const verificationLink = `https://yourwebsite.com/verify?token=${user.token}`;
  
    const mailOptions = {
      from: '<sean.witting@ethereal.email>',
      to: 'sallumia9090@gmail.com',
      subject: 'Account Verification',
      text: `<b>Please click the following link to verify your account: </b> ${verificationLink}`,
    };
  
    await transporter.sendMail(mailOptions);
  };
  
  // =========================================Verfication Email =========================================================
  
  
  
  
  //====================================== Function to send welcome email================================================
  
   exports.sendWelcomeEmail = async (user) => {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
        // user: 'henderson.jast13@ethereal.email',
        // pass: 'gNa5b3gUEuZMr9fFZ4'
          user: 'sallumia9090@gmail.com',
          pass: 'olcmstswidcmhngu'
      }
    });
  
    // Prepare the email content
    const mailOptions = {
      from: 'sallumia9090@gmail.com',
      to: user.email,
      subject: 'Welcome to Your Website',
      text: `Welcome to Your Website Mister ${user.username}! We are excited to have you on board`,
    };
  
    await transporter.sendMail(mailOptions);
  };
  
  //====================================== Function to send welcome email================================================
  
  
  
  //======================================Function to send password reset email==========================================
  
  
    exports.sendPasswordResetEmail = async (user) => {
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'henderson.jast13@ethereal.email',
        pass: 'gNa5b3gUEuZMr9fFZ4'
      }
    });
  
    const resetToken = user.getResetPasswordToken(); // Generate a password reset token
    const resetLink = ` <a href="http://localhost:3000/#/newpswd">http://localhost:3000/#//${resetToken}</a>`;
  
    const mailOptions = {
      from: '<sean.witting@ethereal.email>',
      to: user.email,
      subject: 'Password Reset',
      text: `Please click the following link to reset your password`,
      html: ` <a href="http://localhost:3000/#/newpswd"><b>Please follow this link to Reset Your Password: </b>${resetLink}</a>`
    };
  
    await transporter.sendMail(mailOptions);
  };
  
  //====================================== Function to send password reset email ==========================================




  exports.sendAddStaffPswd = async (staff) => {
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'henderson.jast13@ethereal.email',
        pass: 'gNa5b3gUEuZMr9fFZ4'
      }
    });
  

    const resetToken = staff.getResetPasswordToken(); // Generate a password reset token
    const staffpswdlink = ` http://localhost:3000/#//${resetToken}`;
  
  
    const mailOptions = {
      from: '<sean.witting@ethereal.email>',
      to: staff.email,
      subject: 'Add Staff Password',
      text: `Please click the following link to add your password`,
      html: ` <a href="http://localhost:3000/#/newpswd"><b>Please follow this link to add your pasword: </b>${staffpswdlink}</a>`
    };
  
    await transporter.sendMail(mailOptions);
  };
  
 