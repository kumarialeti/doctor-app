import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import sendEmail from "../utils/sendEmail.js";

// 🔐 REGISTER
export const registerUser = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(200).send({ message: "User already exists", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Automatically set aletikumai@gmail.com as Admin
    const isAdmin = req.body.email === "aletikumai@gmail.com";
    
    const newUser = new User({ ...req.body, password: hashedPassword, isAdmin });
    await newUser.save();
    res.status(200).send({ message: "Register successfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: `Register Controller ${error.message}` });
  }
};

// 🔐 LOGIN
export const loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).send({ message: "User not found", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res.status(200).send({ message: "Invalid Email or Password", success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    
    // Convert to object and delete password
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).send({ message: "Login Success", success: true, token, user: userObj });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `Error in Login CTRL ${error.message}`, success: false });
  }
};

// 🔐 FORGOT PASSWORD
export const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(200).send({ message: "User not found", success: false });
    }

    // Generate strict 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Save to user with 15 mins expiry
    user.resetOTP = otp;
    user.resetOTPExpiry = Date.now() + 15 * 60 * 1000;
    await user.save();

    // Development Environment Fallback: Always print OTP to Terminal
    console.log(`\n===========================================`);
    console.log(`  YOUR PASSWORD RESET PASSCODE IS: ${otp}  `);
    console.log(`===========================================\n`);

    // Send email
    try {
      await sendEmail({
        email: user.email,
        subject: "Your Password Reset Passcode",
        message: `Hello ${user.name},\n\nYour Passcode (OTP) to reset your password is: ${otp}\n\nThis passcode will expire in 15 minutes.\n\nThanks,\nMediCarePro Team`
      });
      console.log(`\n✅ Email sent successfully to ${user.email}`);
    } catch (emailError) {
      console.log("\n⚠️ GOOGLE EMAIL BLOCKED ⚠️");
      console.log("Since Google is currently blocking your email, here is the secret passcode bypassing the email:");
      console.log(`\n============================`);
      console.log(`  YOUR PASSCODE IS: ${otp}  `);
      console.log(`============================\n`);
    }

    res.status(200).send({ message: "Passcode generated successfully (Check Terminal if it didn't email)", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error sending OTP", success: false });
  }
};

// 🔐 RESET PASSWORD
export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(200).send({ message: "User not found", success: false });
    
    if (user.resetOTP !== otp) {
      return res.status(200).send({ message: "Invalid Passcode", success: false });
    }
    
    if (user.resetOTPExpiry < Date.now()) {
      return res.status(200).send({ message: "Passcode has expired. Please request a new one.", success: false });
    }

    // Hash the new password and update
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    user.password = hashedPassword;
    user.resetOTP = null;
    user.resetOTPExpiry = null;
    await user.save();

    res.status(200).send({ message: "Password reset securely!", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: "Error resetting password", success: false });
  }
};