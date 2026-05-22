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

    const emailVerificationToken = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "15m" },
    );


    const verificationUrl = `http://localhost:3000/api/auth/verify-email?token=${emailVerificationToken}`;

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
      console.log(emailError)
    }

    res.status(201).json({
      message: "User Successfully Registered. Please verify your email.",
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmailUrl = async (req, res, next) => {
  try {
    const emailVerificationToken = req.query.token;

    if (!emailVerificationToken) {
      return res.status(400).send(`
        <h2 style="color: red; text-align: center; margin-top: 50px;">
          ❌ Verification token missing hai! Kripya email mein aaye poore link par click karein.
        </h2>
      `);
    }

    let decode = null;
    try {
      decode = jwt.verify(emailVerificationToken, process.env.JWT_SECRET);
    } catch (error) {

      return res.status(400).send(`
        <h2 style="color: red; text-align: center; margin-top: 50px;">
          ❌ Invalid or Expired Token! Kripya naya link request karein.
        </h2>
      `);
    }

    const user = await userModel.findOne({ email: decode.email });

    if (!user) {
      return res.status(404).send(`
        <h2 style="color: red; text-align: center; margin-top: 50px;">
          ❌ User not found in database!
        </h2>
      `);
    }

    if (user.isVerified) {
      return res.status(200).send(`
         <h2 style="color: green; text-align: center; margin-top: 50px;">
           ✅ Email is already verified! Aap login kar sakte hain.
         </h2>
       `);
    }

    user.isVerified = true;
    await user.save();

    const html = `
    <div style="text-align: center; margin-top: 50px; font-family: sans-serif; background-color: #f9fafb; padding: 40px;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); display: inline-block;">
            <h1 style="color: #10B981; font-size: 40px; margin: 0;">✅</h1>
            <h2 style="color: #374151;">Email Verified Successfully!</h2>
            <p style="color: #6B7280;">Welcome aboard, <strong>${user.username}</strong>! Aapka account activate ho gaya hai.</p>
            <p style="color: #9CA3AF; font-size: 14px; margin-top: 20px;">Ab aap is tab ko close karke app mein login kar sakte hain.</p>
            
           <a href="/api/auth/login" style="background-color: #4F46E5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 20px; font-weight: bold;">
              Go to Login
            </a>
            </a>
          </div>
      </div>
    `;

    res.send(html)
  } catch (error) {
    next(error);
  }
};
