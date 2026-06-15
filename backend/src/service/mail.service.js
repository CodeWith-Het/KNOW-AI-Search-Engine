import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";
import { google } from "googleapis";

// OAuth2 Client setup
const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  try {
    const oauth2Client = new OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      "https://developers.google.com/oauthplayground"
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });

    const accessToken = await new Promise((resolve, reject) => {
      oauth2Client.getAccessToken((err, token) => {
        if (err) {
          reject("Failed to create access token: " + err);
        }
        resolve(token);
      });
    });

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: process.env.GOOGLE_USER,
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
      },
    });

    return transporter;
  } catch (error) {
    console.error("Transporter creation error: ", error);
    throw error;
  }
};

export const sendmail = async ({ to, subject, html }) => {
  try {
    const emailTransporter = await createTransporter();
    
    const mailOptions = {
      from: process.env.GOOGLE_USER, 
      to,
      subject,
      html,
    };

    const info = await emailTransporter.sendMail(mailOptions);
    console.log(`\x1b[32m[Email Success]\x1b[0m Email sent to ${to}`);
    return info;
    
  } catch (error) {
    console.error(`\x1b[31m[Email Error]\x1b[0m Failed to send email:`, error);
    throw error;
  }
};
