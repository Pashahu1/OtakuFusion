import { connectDB } from '@/lib/db';
import User from '@/models/User';
import {
  assignVerificationCode,
  deliverVerificationEmail,
} from '@/server/auth/verification';
import { handleRouteError, jsonMessage, readJsonBody } from '@/lib/http';

export const runtime = 'nodejs';

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

    const verificationCode = await assignVerificationCode(user);
    await deliverVerificationEmail(user.email, verificationCode);
    return jsonMessage('Verification code resent.', 200);
  } catch (err) {
    return handleRouteError(err, 'Resend verification error:');
  }
}
