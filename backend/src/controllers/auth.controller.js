import userModel from "../models/user.model.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { OAuth2Client } from "google-auth-library";

import { sendmail } from "../service/mail.service.js";
import redis from "../config/redis.js";
import AppError from "../utils/AppError.js";

// =====================================================
// GOOGLE CLIENT
// =====================================================

const googleClient = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);

// =====================================================
// JWT COOKIE
// =====================================================

const setAuthCookie = (res, userId) => {
  const token = jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "2d",
    }
  );

  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite:
      process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 2 * 24 * 60 * 60 * 1000,
  });

  return token;
};

// =====================================================
// OTP GENERATOR
// =====================================================

const generateOtp = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

// =====================================================
// HASH OTP
// =====================================================

const hashOtp = (otp) => {
  return crypto
    .createHash("sha256")
    .update(otp)
    .digest("hex");
};

// =====================================================
// REGISTER USER
// =====================================================

export const registerUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    const requestedUsername = (username || "").trim();
    const normalizedEmail = (email || "").trim().toLowerCase();

    // -------------------------------------------------
    // REQUIRED FIELDS
    // -------------------------------------------------

    if (!requestedUsername || !normalizedEmail || !password) {
      return next(
        new AppError(
          "Username, email, and password are required.",
          400,
          "MISSING_FIELDS"
        )
      );
    }

    // -------------------------------------------------
    // CHECK EXISTING USER
    // -------------------------------------------------

    const existingUser = await userModel.findOne({
      $or: [
        {
          username: requestedUsername,
        },
        {
          email: normalizedEmail,
        },
      ],
    });

    if (existingUser) {
      // -----------------------------------------------
      // GOOGLE ACCOUNT ALREADY EXISTS
      // -----------------------------------------------

      if (
        existingUser.email === normalizedEmail &&
        existingUser.authProvider === "google"
      ) {
        return next(
          new AppError(
            "This email is registered with Google. Please continue with Google.",
            409,
            "GOOGLE_ACCOUNT_EXISTS"
          )
        );
      }

      // -----------------------------------------------
      // NORMAL ACCOUNT ALREADY EXISTS
      // -----------------------------------------------

      return next(
        new AppError(
          "User already exists.",
          409,
          "USER_ALREADY_EXISTS"
        )
      );
    }

    // -------------------------------------------------
    // CREATE LOCAL USER
    // -------------------------------------------------

    const user = await userModel.create({
      username: requestedUsername,
      email: normalizedEmail,
      password,
      authProvider: "local",
      isVerified: false,
    });

    // =================================================
    // CREATE OTP
    // =================================================

    const otp = generateOtp();
    const otpHash = hashOtp(otp);

    const otpKey = `otp:verify:${user._id}`;
    const attemptsKey = `otp:attempts:${user._id}`;

    // OTP expires after 5 minutes
    await redis.set(
      otpKey,
      otpHash,
      "EX",
      5 * 60
    );

    // Reset attempts
    await redis.set(
      attemptsKey,
      "0",
      "EX",
      5 * 60
    );

    // =================================================
    // SEND OTP EMAIL
    // =================================================

    try {
      await sendmail({
        to: user.email,

        subject: "🔐 KNOW-AI Email Verification OTP",

        text: `
Hello ${user.username},

Your KNOW-AI verification OTP is:

${otp}

This OTP will expire in 5 minutes.

If you did not create this account, please ignore this email.
        `,

        html: `
<div style="
  font-family: Arial, sans-serif;
  max-width: 500px;
  margin: auto;
  padding: 25px;
">

  <h2 style="color:#4F46E5;">
    Welcome to KNOW-AI 🚀
  </h2>

  <p>
    Hello <strong>${user.username}</strong>,
  </p>

  <p>
    Your email verification OTP is:
  </p>

  <div style="
    font-size: 32px;
    font-weight: bold;
    letter-spacing: 8px;
    background: #f3f4f6;
    padding: 15px;
    text-align: center;
    border-radius: 8px;
  ">
    ${otp}
  </div>

  <p>
    This OTP will expire in <strong>5 minutes</strong>.
  </p>

  <p style="color:#777;font-size:13px;">
    If you did not create this account, please ignore this email.
  </p>

</div>
        `,
      });
    } catch (emailError) {
      console.error(
        "OTP email failed:",
        emailError
      );

      // Remove OTP
      await redis.del(
        otpKey,
        attemptsKey
      );

      // Delete temporary user
      await userModel.findByIdAndDelete(
        user._id
      );

      return next(
        new AppError(
          "Unable to send verification OTP. Please try again.",
          503,
          "OTP_EMAIL_FAILED"
        )
      );
    }

    // =================================================
    // RESPONSE
    // =================================================

    return res.status(201).json({
      success: true,

      message:
        "Registration successful. OTP has been sent to your email.",

      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        authProvider: user.authProvider,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// VERIFY OTP
// =====================================================

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    const normalizedEmail = (email || "")
      .trim()
      .toLowerCase();

    // -------------------------------------------------
    // REQUIRED FIELDS
    // -------------------------------------------------

    if (!normalizedEmail || !otp) {
      return next(
        new AppError(
          "Email and OTP are required.",
          400,
          "OTP_FIELDS_MISSING"
        )
      );
    }

    // -------------------------------------------------
    // FIND USER
    // -------------------------------------------------

    const user = await userModel.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return next(
        new AppError(
          "User not found.",
          404,
          "USER_NOT_FOUND"
        )
      );
    }

    // -------------------------------------------------
    // ALREADY VERIFIED
    // -------------------------------------------------

    if (user.isVerified) {
      return res.status(200).json({
        success: true,

        message: "Email is already verified.",

        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          authProvider: user.authProvider,
          isVerified: true,
        },
      });
    }

    // -------------------------------------------------
    // REDIS KEYS
    // -------------------------------------------------

    const otpKey = `otp:verify:${user._id}`;
    const attemptsKey = `otp:attempts:${user._id}`;

    // -------------------------------------------------
    // GET OTP HASH
    // -------------------------------------------------

    const storedOtpHash =
      await redis.get(otpKey);

    if (!storedOtpHash) {
      return next(
        new AppError(
          "OTP has expired or does not exist.",
          400,
          "OTP_EXPIRED"
        )
      );
    }

    // -------------------------------------------------
    // CHECK ATTEMPTS
    // -------------------------------------------------

    const attempts =
      Number(await redis.get(attemptsKey)) || 0;

    if (attempts >= 5) {
      await redis.del(
        otpKey,
        attemptsKey
      );

      return next(
        new AppError(
          "Too many incorrect attempts. Please request a new OTP.",
          429,
          "OTP_ATTEMPTS_EXCEEDED"
        )
      );
    }

    // -------------------------------------------------
    // HASH ENTERED OTP
    // -------------------------------------------------

    const enteredOtpHash =
      hashOtp(otp);

    // -------------------------------------------------
    // INVALID OTP
    // -------------------------------------------------

    if (enteredOtpHash !== storedOtpHash) {
      await redis.incr(attemptsKey);

      return next(
        new AppError(
          "Invalid OTP.",
          400,
          "INVALID_OTP"
        )
      );
    }

    // =================================================
    // OTP SUCCESS
    // =================================================

    user.isVerified = true;

    await user.save();

    // Remove OTP
    await redis.del(
      otpKey,
      attemptsKey
    );

    return res.status(200).json({
      success: true,

      message:
        "Email successfully verified. You can now login.",

      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        authProvider: user.authProvider,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// LOGIN USER
// =====================================================

export const loginUser = async (req, res, next) => {
  try {
    const { loginId, password } = req.body;

    const identifier = (loginId || "").trim();

    // -------------------------------------------------
    // REQUIRED FIELDS
    // -------------------------------------------------

    if (!identifier || !password) {
      return next(
        new AppError(
          "Credentials missing.",
          400,
          "CREDENTIALS_MISSING"
        )
      );
    }

    // -------------------------------------------------
    // FIND USER
    // -------------------------------------------------

    const user = await userModel
      .findOne({
        $or: [
          {
            username: identifier,
          },
          {
            email: identifier.toLowerCase(),
          },
        ],
      })
      .select("+password");

    if (!user) {
      return next(
        new AppError(
          "User not found.",
          404,
          "USER_NOT_FOUND"
        )
      );
    }

    // -------------------------------------------------
    // GOOGLE ACCOUNT
    // -------------------------------------------------

    if (user.authProvider === "google") {
      return next(
        new AppError(
          "This account uses Google Login. Please continue with Google.",
          400,
          "GOOGLE_ACCOUNT"
        )
      );
    }

    // -------------------------------------------------
    // EMAIL NOT VERIFIED
    // -------------------------------------------------

    if (!user.isVerified) {
      return next(
        new AppError(
          "Please verify your email before login.",
          403,
          "EMAIL_NOT_VERIFIED"
        )
      );
    }

    // -------------------------------------------------
    // PASSWORD CHECK
    // -------------------------------------------------

    const isPasswordMatch =
      await user.comparePassword(password);

    if (!isPasswordMatch) {
      return next(
        new AppError(
          "Password invalid.",
          401,
          "WRONG_PASSWORD"
        )
      );
    }

    // -------------------------------------------------
    // CREATE JWT
    // -------------------------------------------------

    setAuthCookie(
      res,
      user._id
    );

    // -------------------------------------------------
    // RESPONSE
    // -------------------------------------------------

    return res.status(200).json({
      success: true,

      message:
        "User successfully logged in.",

      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        authProvider: user.authProvider,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GOOGLE AUTH START
// =====================================================

export const googleAuth = async (
  req,
  res,
  next
) => {
  try {
    const authUrl =
      googleClient.generateAuthUrl({
        access_type: "offline",

        scope: [
          "openid",
          "email",
          "profile",
        ],

        prompt: "select_account",
      });

    return res.redirect(authUrl);
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GOOGLE AUTH CALLBACK
// =====================================================

export const googleAuthCallback = async (
  req,
  res,
  next
) => {
  try {
    const { code } = req.query;

    // -------------------------------------------------
    // GOOGLE CODE MISSING
    // -------------------------------------------------

    if (!code) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=GOOGLE_CODE_MISSING`
      );
    }

    // -------------------------------------------------
    // EXCHANGE CODE FOR TOKENS
    // -------------------------------------------------

    const { tokens } =
      await googleClient.getToken(code);

    if (!tokens.id_token) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=GOOGLE_TOKEN_INVALID`
      );
    }

    // -------------------------------------------------
    // VERIFY GOOGLE ID TOKEN
    // -------------------------------------------------

    const ticket =
      await googleClient.verifyIdToken({
        idToken: tokens.id_token,
        audience:
          process.env.GOOGLE_CLIENT_ID,
      });

    const payload =
      ticket.getPayload();

    if (!payload) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=GOOGLE_USER_INVALID`
      );
    }

    // -------------------------------------------------
    // GOOGLE USER DATA
    // -------------------------------------------------

    const {
      sub: googleId,
      email,
      name,
      email_verified,
    } = payload;

    // -------------------------------------------------
    // EMAIL CHECK
    // -------------------------------------------------

    if (!email || !email_verified) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/login?error=GOOGLE_EMAIL_NOT_VERIFIED`
      );
    }

    const normalizedEmail =
      email.trim().toLowerCase();

    // -------------------------------------------------
    // FIND EXISTING USER
    // -------------------------------------------------

    let user =
      await userModel.findOne({
        email: normalizedEmail,
      });

    // =================================================
    // EXISTING USER
    // =================================================

    if (user) {
      // -----------------------------------------------
      // EXISTING LOCAL ACCOUNT
      // -----------------------------------------------

      if (
        user.authProvider === "local"
      ) {
        console.log(
          "Google login blocked: local account already exists:",
          normalizedEmail
        );

        return res.redirect(
          `${process.env.FRONTEND_URL}/login?error=EMAIL_ALREADY_REGISTERED`
        );
      }

      // -----------------------------------------------
      // EXISTING GOOGLE ACCOUNT
      // -----------------------------------------------

      if (
        user.authProvider === "google"
      ) {
        // Security check
        if (
          user.googleId &&
          user.googleId !== googleId
        ) {
          return res.redirect(
            `${process.env.FRONTEND_URL}/login?error=GOOGLE_ACCOUNT_MISMATCH`
          );
        }

        // Update Google ID
        user.googleId = googleId;

        // Update username if Google provides one
        if (name) {
          user.username = name;
        }

        // Google verified email
        user.isVerified = true;

        await user.save();
      }
    }

    // =================================================
    // CREATE NEW GOOGLE USER
    // =================================================

    else {
      user =
        await userModel.create({
          username:
            name ||
            normalizedEmail.split("@")[0],

          email: normalizedEmail,

          googleId,

          authProvider: "google",

          isVerified: true,

          password: undefined,
        });
    }

    // =================================================
    // CREATE LOGIN COOKIE
    // =================================================

    setAuthCookie(
      res,
      user._id
    );

    // =================================================
    // REDIRECT TO APPLICATION
    // =================================================

    return res.redirect(
      `${process.env.FRONTEND_URL}/chat`
    );
  } catch (error) {
    console.error(
      "Google OAuth Error:",
      error
    );

    return res.redirect(
      `${process.env.FRONTEND_URL}/login?error=GOOGLE_AUTH_FAILED`
    );
  }
};

// =====================================================
// GET CURRENT USER
// =====================================================

export const getUser = async (
  req,
  res,
  next
) => {
  try {
    const userId = req.user.id;

    const user =
      await userModel
        .findById(userId)
        .select("-password");

    if (!user) {
      return next(
        new AppError(
          "User not found.",
          404,
          "USER_NOT_FOUND"
        )
      );
    }

    return res.status(200).json({
      success: true,

      message:
        "User successfully fetched.",

      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        authProvider: user.authProvider,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// LOGOUT USER
// =====================================================

export const logoutUser = async (
  req,
  res,
  next
) => {
  try {
    const token =
      req.cookies?.token;

    // -------------------------------------------------
    // BLACKLIST JWT
    // -------------------------------------------------

    if (token) {
      await redis.set(
        `blacklist:${token}`,
        "true",
        "EX",
        2 * 24 * 60 * 60
      );
    }

    // -------------------------------------------------
    // CLEAR COOKIE
    // -------------------------------------------------

    res.clearCookie("token", {
      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite:
        process.env.NODE_ENV ===
        "production"
          ? "none"
          : "lax",
    });

    return res.status(200).json({
      success: true,

      message:
        "User successfully logged out.",
    });
  } catch (error) {
    next(error);
  }
};