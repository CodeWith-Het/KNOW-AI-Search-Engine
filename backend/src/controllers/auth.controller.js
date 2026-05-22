import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendEmail } from "../service/mail.service.js";

export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const isAlreadyExist = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isAlreadyExist) {
      return res.status(409).json({
        message: "User with this email or username already exists",
        success: false,
        error: "User already exists",
      });
    }

    const user = await userModel.create({
      username,
      email,
      password,
    });

    // 1. Token (Tumhare login/auth ke liye)
    const emailVerificationToken = jwt.sign({
      email: user.email
    }, process.env.JWT_SECRET, { expiresIn: "24h" })
    
    const verificationUrl = `http://localhost:5173/api/auth/verify-email?token=${verificationToken}`

    const emailHtmlTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4F46E5;">Verify Your Email, ${user.username}! 🚀</h2>
          <p>Please click the button below to verify your email address. This link is valid for 15 minutes.</p>
          
          <a href="${verificationUrl}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 15px;">
            Verify Email
          </a>
          
          <p style="margin-top: 20px; font-size: 14px; color: #666;">Or copy and paste this link in your browser:</p>
          <p style="font-size: 12px; color: #007bff; word-break: break-all;">${verificationUrl}</p>
        </div>
      `;

    try {
      await sendEmail({
        to: user.email,
        subject: "🔐 Verify Your Email Address",
        text: `Hi ${username}, verify your email by clicking here: ${verificationUrl}`,
        html: emailHtmlTemplate,
      });
    } catch (emailError) {
      console.log("Email bhejne mein error:", emailError);
    }

    res.status(201).json({
      message: "User Successfully Registered. Please verify your email.",
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      }
    });
  } catch (error) {
    next(error);
  }
};

export const verifyUrl =async (req,res,next) => {
  const { token } = req.query
  
  const decode = jwt.verify(token,process.env.JWT_SECRET)

  const user = await userModel.findOne({ email: decode.email })
  
  if (!user) {
    return res.status(400).json({
      message: "invaild Token",
      success: false,
      error:"USER NOT FLOUND"
    })
  }

  user.isVerified=true

  await user.save();

  
}