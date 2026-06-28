import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendmail = async ({ to, subject, text, html }) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject,
      text,
      html,
    });

    if (error) {
      console.error(`\x1b[31m[Email Error]\x1b[0m Failed to send email:`, error);
      throw error;
    }

    console.log(`\x1b[32m[Email Success]\x1b[0m Email sent to ${to}`);
    return data;

  } catch (error) {
    console.error(`\x1b[31m[Email Error]\x1b[0m Failed to send email:`, error);
    throw error;
  }
};