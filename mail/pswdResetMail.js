// resetPassword.js
const nodemailer = require("nodemailer");
const otpGenerator = require("otp-generator");

const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "kaden.schinner74@ethereal.email",
    pass: "QyT35B8h2fwjuMvhTf",
  },
});

function sendEmailWithOTP(email, otp) {
  const mailOptions = {
    from: "<sean.witting@ethereal.email>",
    to: email,
    subject: "Password Reset OTP",
    text: `Your OTP for password reset is ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}

function generateOTP() {
  return otpGenerator.generate(6, {
    digits: true,
    alphabets: false,
    upperCase: false,
    specialChars: false,
  });
}

module.exports = { sendEmailWithOTP, generateOTP };
