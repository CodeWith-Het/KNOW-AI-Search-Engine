import dotenv from "dotenv";
dotenv.config();

import sgMail from "@sendgrid/mail";

// ------------------------------------
// SendGrid Configuration
// ------------------------------------

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM = process.env.SENDGRID_FROM;

// Check required environment variables
if (!SENDGRID_API_KEY) {
  console.error("❌ SENDGRID_API_KEY is missing in .env");
}

if (!SENDGRID_FROM) {
  console.error("❌ SENDGRID_FROM is missing in .env");
}

// Set API key only if available
if (SENDGRID_API_KEY) {
  sgMail.setApiKey(SENDGRID_API_KEY);
}


// ------------------------------------
// Send Email
// ------------------------------------

export const sendmail = async ({
  to,
  subject,
  text,
  html,
}) => {

  // Validate configuration
  if (!SENDGRID_API_KEY) {
    throw new Error("SENDGRID_API_KEY is not configured.");
  }

  if (!SENDGRID_FROM) {
    throw new Error("SENDGRID_FROM is not configured.");
  }

  // Validate email data
  if (!to) {
    throw new Error("Recipient email (to) is required.");
  }

  if (!subject) {
    throw new Error("Email subject is required.");
  }

  if (!text && !html) {
    throw new Error("Email must contain text or html content.");
  }


  // ------------------------------------
  // SendGrid Message
  // ------------------------------------

  const message = {
    from: SENDGRID_FROM,
    to,
    subject,
    text,
    html,
  };


  // ------------------------------------
  // Send Email
  // ------------------------------------

  try {

    const response = await sgMail.send(message);

    console.log(`✅ Email successfully sent to ${to}`);

    return {
      success: true,
      message: "Email sent successfully",
      statusCode: response[0]?.statusCode,
    };

  } catch (error) {

    console.error("❌ SendGrid Email Error");

    // SendGrid API error
    if (error?.response?.body?.errors) {

      console.error(
        "SendGrid Errors:",
        error.response.body.errors
      );

    } else {

      console.error(
        "Error:",
        error?.message || error
      );

    }

    // Important:
    // Controller / Queue Worker can handle this error
    throw error;
  }
};