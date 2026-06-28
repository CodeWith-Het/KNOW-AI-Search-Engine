import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const createTransporter = async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,              
      secure: false,          
      family: 4,               
      auth: {
        user: process.env.GOOGLE_USER,
        pass: process.env.GOOGLE_APP_PASSWORD
      },
    });

    await transporter.verify();
    console.log("✅ SMTP Connected");
    return transporter;
  } catch (error) {
    console.error("Transporter creation error: ", error);
    throw error;
  }
};

export const sendmail = async ({ to, subject, text,html }) => {
  try {
    const emailTransporter = await createTransporter();
    
    const mailOptions = {
      from: process.env.GOOGLE_USER, 
      to,
      subject,
      text,
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
