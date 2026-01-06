import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(to: string, token: string) {
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/verify-email?token=${token}`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"OtakuFusion" <no-reply@otakufusion.dev>',
    to,
    subject: 'Email Verification',
    html: `
      <h1>Account Verification</h1>
      <p>Click the button to verify your email:</p>
      <p><a href="${verifyUrl}">Verify Email</a></p>
      <p>If you haven't registered, simply ignore this email.</p>
    `,
  });
}
