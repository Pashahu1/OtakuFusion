import nodemailer from 'nodemailer';

export async function sendVerificationEmail(email: string, code: string) {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const html = `
  <div style="
    width: 100%;
    background: #0d0d0d;
    padding: 40px 0;
    font-family: 'Inter', Arial, sans-serif;
  ">
    <div style="
      max-width: 480px;
      margin: 0 auto;
      background: #141414;
      border: 1px solid #1f1f1f;
      border-radius: 14px;
      padding: 32px;
      color: #e5e5e5;
    ">

      <div style="text-align: center; margin-bottom: 24px;">
        <img src="https://gachiakuta-anime.com/assets/img/chara/chara_list/chara_list_21.png" alt="OtakuFusion" width="50" style="opacity: 0.9;" />
      </div>

      <h2 style="
        font-size: 24px;
        font-weight: 700;
        text-align: center;
        margin: 0 0 12px 0;
        color: #ff7b00;
      ">
        Verify your email
      </h2>

      <p style="
        font-size: 15px;
        line-height: 1.6;
        text-align: center;
        color: #c7c7c7;
        margin-bottom: 24px;
      ">
        Use the verification code below to complete your registration on <strong>OtakuFusion</strong>.
      </p>

      <div style="
        background: #1c1c1c;
        padding: 18px 0;
        border-radius: 10px;
        text-align: center;
        margin-bottom: 24px;
        border: 1px solid #2a2a2a;
      ">
        <span style="
          font-size: 36px;
          font-weight: 700;
          letter-spacing: 10px;
          color: #ff7b00;
          font-family: 'Courier New', monospace;
        ">
          ${code}
        </span>
      </div>

      <p style="
        font-size: 14px;
        color: #a1a1a1;
        text-align: center;
        margin-bottom: 30px;
      ">
        This code will expire in <strong>10 minutes</strong>.
      </p>

      <div style="
        height: 1px;
        background: #1f1f1f;
        margin: 24px 0;
      "></div>

      <p style="
        font-size: 13px;
        color: #6f6f6f;
        text-align: center;
        line-height: 1.5;
      ">
        If you didn’t request this email, you can safely ignore it.<br/>
        This message was sent automatically by OtakuFusion.
      </p>

    </div>
  </div>
`;

  await transporter.sendMail({
    from: `"OtakuFusion" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your OtakuFusion verification code',
    html,
  });
}
