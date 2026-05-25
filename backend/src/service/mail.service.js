import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_USER,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

transporter
  .verify()
  .then(() => {
    console.log("Email transporter is ready for send Email 🟢");
  })
  .catch((err) => {
    console.error("Email transporter verified fails 🔴", err);
  });

export async function sendEmail({ to, subject, html, text }) {
  try {
    const mailOption = {
      from: process.env.GOOGLE_USER,
      to,
      subject,
      html,
      text,
    };

    const details = await transporter.sendMail(mailOption);
    console.log("Email sent successfully. Message ID:", details.messageId);

    return details;
  } catch (error) {
    console.error("error is send email take more time", error);
    throw error;
  }
}
