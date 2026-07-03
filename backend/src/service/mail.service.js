import dotend from "dotenv"
dotend.config()
import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendmail = async ({ to, subject, text, html }) => {

  // check it
  if (!process.env.SENDGRID_API_KEY) {
    console.log("🚨 ERROR: SENDGRID_API_KEY is MISSING in .env file!");
  }
  if (!process.env.SENDGRID_FROM) {
    console.log("🚨 ERROR: SENDGRID_FROM is MISSING in .env file!");
  }

  //process it
  try {
    await sgMail.send({
      from: process.env.SENDGRID_FROM,
      to,
      subject,
      text,
      html,
    });
    console.log(`✅ Email sent to ${to}`);
  } catch (error) {
    console.error(`❌ SendGrid Email Error:`);
    if (error.response) {
      console.error(error.response.body.errors)
    }else {
      console.error(error.message);
    }

    throw error;
  }
};