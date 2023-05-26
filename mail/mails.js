
// =========================================Verfication Email =========================================================
const nodemailer = require('nodemailer');

 exports.sendVerificationEmail = async (user) => {
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'osborne.gerhold6@ethereal.email',
        pass: 'vUAJymvkWZydqMf5q4'
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
  
   exports.sendWelcomeEmail = async (user) => {
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'osborne.gerhold6@ethereal.email',
        pass: 'vUAJymvkWZydqMf5q4'
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
  
  
    exports.sendPasswordResetEmail = async (user) => {
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      auth: {
        user: 'osborne.gerhold6@ethereal.email',
        pass: 'vUAJymvkWZydqMf5q4'
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