import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { handleRouteError, jsonMessage, readJsonBody } from '@/lib/http';

export async function POST(req: Request) {
  try {
    await connectDB();

    const json = await readJsonBody(req);
    if (!json.ok) return json.response;

    const data = json.data;
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return jsonMessage('Email and code are required.', 400);
    }

    const { email, code } = data as { email?: unknown; code?: unknown };
    if (
      typeof email !== 'string' ||
      typeof code !== 'string' ||
      !email ||
      !code
    ) {
      return jsonMessage('Email and code are required.', 400);
    }
    const user = await User.findOne({
      email,
      verificationCode: code,
      verificationCodeExpires: { $gt: new Date() },
    });
    if (!user) {
      return jsonMessage('Invalid or expired code.', 400);
    }

    user.isVerified = true;
    user.verificationCode = null;
    user.verificationCodeExpires = null;
    
    await user.save();
    return NextResponse.json(
      { message: 'Email verified successfully.' },
      { status: 200 }
    );
  } catch (err) {
    return handleRouteError(err, 'Verify email error:');
  }
}
