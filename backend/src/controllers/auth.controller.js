import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { sendmail } from "../service/mail.service.js";
import redis from '../config/redis.js';
import AppError from './../utils/AppError.js';

export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const isAlreadyExist = await userModel.findOne({
      $or: [{ username }, { email }],
    });

    if (isAlreadyExist) {
      return next(new AppError("User already exists.",409,"USER_ALREADY_EXISTS"));
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


    const verificationUrl = `${process.env.BACKEND_URL}/api/auth/verify-email?token=${emailVerificationToken}`;

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
      await sendmail({
        to: user.email,
        subject: "🔐 Verify Your Email Address",
        text: `Hi ${username}, verify your email by clicking here: ${verificationUrl}`,
        html: emailHtmlTemplate,
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      await user.deleteOne();

      // for error status
      return next(new AppError("Unable to send verification email. Please try again later.",500,"EMAIL_SEND_FAILED"))
    }

    res.status(201).json({
      success: true,
      message: "User successfully registered. Please verify your email before login.",
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
  const frontendVerifyUrl = `${process.env.FRONTEND_URL}/verify-email`;

  try {
    const emailVerificationToken = req.query.token;

    if (!emailVerificationToken) {
      return res.redirect(
        `${frontendVerifyUrl}?status=error&reason=TOKEN_NOT_PROVIDED`,
      );
    }

    let decode = null;
    try {
      decode = jwt.verify(emailVerificationToken, process.env.JWT_SECRET);
    } catch (error) {
      return res.redirect(
        `${frontendVerifyUrl}?status=error&reason=INVALID_TOKEN`,
      );
    }

    const user = await userModel.findOne({ email: decode.email });

    if (!user) {
      return res.redirect(
        `${frontendVerifyUrl}?status=error&reason=USER_NOT_FOUND`,
      );
    }

    if (user.isVerified) {
      return res.redirect(
        `${frontendVerifyUrl}?status=success&username=${encodeURIComponent(user.username)}&already=true`,
      );
    }

    user.isVerified = true;
    await user.save();

    return res.redirect(
      `${frontendVerifyUrl}?status=success&username=${encodeURIComponent(user.username)}`,
    );
  } catch (error) {
    console.error("verifyEmailUrl error:", error);
    return res.redirect(`${frontendVerifyUrl}?status=error&reason=SERVER_ERROR`);
  }
};
export const loginUser = async (req, res, next) => {
  try {

    const { loginId, username, email, password } = req.body;
    

    const identifier = loginId || username || email;

    if (!identifier || !password) {
      return next(new AppError("Credentials missing",400,"CREDENTIALS_MISSING"))
    }

    const user = await userModel
      .findOne({
        $or: [{ username: identifier }, { email: identifier }],
      })
      .select("+password");

    if (!user) {
      return next(new AppError("User Not Found",404,"USER_NOT_FOUND"))
    }

    const isPasswordMatch = await user.comparePassword(password);

    if (!isPasswordMatch) {
      return next(new AppError("Password invalid",401,"WRONG_PASSWORD"))
    }

   const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "2d" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 2 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      message: "User successfully logged in",
      user: { id: user._id, username: user.username, email: user.email, isVerified: user.isVerified },
    });
  } catch (error) {
    next(error);
  }
};


export const getUser = async (req, res, next) => {
  try {
    const userid = req.user.id

  const user = await userModel.findById(userid).select("-password") 
  
  if (!user) {
    return next(new AppError("User Not Found",404,"USER_NOT_FOUND"))
  }

  user.password = undefined
  
  res.status(200).json({
    success:true,
    message:"User Successfully Fetch",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      isVerified: user.isVerified,
    }
  })
  }
  catch (error) {
    next(error)
  }
}

export const logoutUser = async (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (token) {
      await redis.set(
        `blacklist:${token}`,
        "true",
        "EX",
        2 * 24 * 60 * 60 
      );
    }

    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    res.status(200).json({
      success: true,
      message: "User successfully logged out",
    });
  } catch (error) {
    next(error);
  }
};