import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: Number(process.env.BREVO_SMTP_PORT),
  secure: false,

  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASSWORD,
  },
});

export const sendmail = async ({
  to,
  subject,
  text,
  html,
}) => {

  if (!process.env.BREVO_SMTP_USER) {
    throw new Error("BREVO_SMTP_USER is not configured.");
  }

  if (!process.env.BREVO_SMTP_PASSWORD) {
    throw new Error("BREVO_SMTP_PASSWORD is not configured.");
  }

  if (!process.env.BREVO_FROM_EMAIL) {
    throw new Error("BREVO_FROM_EMAIL is not configured.");
  }

  if (!to) {
    throw new Error("Recipient email is required.");
  }

  if (!subject) {
    throw new Error("Email subject is required.");
  }

  if (!text && !html) {
    throw new Error("Email must contain text or HTML content.");
  }

  const mailOptions = {
    from: `"${process.env.BREVO_FROM_NAME}" <${process.env.BREVO_FROM_EMAIL}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Email sent successfully to ${to}`);
    console.log(`📩 Message ID: ${info.messageId}`);

    return {
      success: true,
      message: "Email sent successfully",
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("❌ Brevo Email Error:", error.message);

    throw error;
  }
};