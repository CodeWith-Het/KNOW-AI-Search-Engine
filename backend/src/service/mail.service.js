import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export const sendmail = async ({ to, subject, text, html }) => {
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
    console.error(`❌ Email Error:`, error);
    throw error;
  }
};