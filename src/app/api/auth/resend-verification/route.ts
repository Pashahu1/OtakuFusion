import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { sendVerificationEmail } from '@/lib/mailer';
import { handleRouteError, jsonMessage, readJsonBody } from '@/lib/http';

export async function POST(req: Request) {
  try {
    await connectDB();

    const json = await readJsonBody(req);
    if (!json.ok) return json.response;

    const data = json.data;
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return jsonMessage('Email is required.', 400);
    }

    const emailRaw = (data as { email?: unknown }).email;
    if (typeof emailRaw !== 'string' || !emailRaw.trim()) {
      return jsonMessage('Email is required.', 400);
    }
    const email = emailRaw.trim();

    const user = await User.findOne({ email });
    if (!user) {
      return jsonMessage('User not found.', 404);
    }
    if (user.isVerified) {
      return jsonMessage('Email is already verified.', 200);
    }
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    user.verificationCode = verificationCode;
    user.verificationCodeExpires = verificationCodeExpires;
    await user.save();
    await sendVerificationEmail(user.email, verificationCode);
    return jsonMessage('Verification code resent.', 200);
  } catch (err) {
    return handleRouteError(err, 'Resend verification error:');
  }
}
