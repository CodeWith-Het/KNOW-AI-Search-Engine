import dotenv from "dotenv";
dotenv.config(); // Isko yahin chalana sabse zaroori hai taaki variables turant mil jayein!

import nodemailer from "nodemailer";

// Yeh line humein batayegi ki email sahi se load hua ya nahi
console.log("Mail Service Check -> Email ID:", process.env.GOOGLE_USER);

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
    console.error("Email send karte waqt error aaya:", error);
    throw error;
  }
}
