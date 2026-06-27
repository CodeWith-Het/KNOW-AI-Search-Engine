import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";
import { google } from "googleapis";

// OAuth2 Client setup
const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: process.env.GOOGLE_USER,
        pass:process.env.GOOGLE_APP_PASSWORD
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
