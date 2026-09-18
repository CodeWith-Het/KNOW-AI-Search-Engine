import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.BREVO_SMTP_HOST,
  port: Number(process.env.BREVO_SMTP_PORT),
  secure: Number(process.env.BREVO_SMTP_PORT) === 465,
  auth: {
    user: process.env.BREVO_SMTP_USER,
    pass: process.env.BREVO_SMTP_PASSWORD,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Connection Error:", error.message);
  } else {
    console.log("✅ SMTP Server is ready to take our messages");
  }
});

export const sendmail = async ({
  to,
  subject,
  text,
  html,
}) => {

  if (!process.env.BREVO_SMTP_USER || !process.env.BREVO_SMTP_PASSWORD) {
    throw new Error("SMTP credentials (USER/PASSWORD) are not configured.");
  }
  if (!process.env.BREVO_FROM_EMAIL) {
    throw new Error("BREVO_FROM_EMAIL is not configured.");
  }
  if (!to || !subject) {
    throw new Error("Recipient email and subject are required.");
  }
  if (!text && !html) {
    throw new Error("Email must contain text or HTML content.");
  }

  const mailOptions = {
    from: `"${process.env.BREVO_FROM_NAME || 'App Support'}" <${process.env.BREVO_FROM_EMAIL}>`,
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