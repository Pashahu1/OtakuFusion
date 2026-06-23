import bcrypt from 'bcryptjs';

import { createSessionResponse } from '@/lib/auth-session-response';
import { connectDB } from '@/lib/db';
import {
  handleRouteError,
  jsonMessage,
  parseWithSchema,
  readJsonBody,
} from '@/lib/http';
import User from '@/models/User';
import { sendVerificationEmail } from '@/lib/mailer';
import {
  assignVerificationCode,
  deliverVerificationEmail,
} from '@/server/auth/verification';
import { RegisterBodySchema } from '@/shared/schemas/api';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    await connectDB();

    const json = await readJsonBody(req);
    if (!json.ok) return json.response;

    const parsed = parseWithSchema(RegisterBodySchema, json.data);
    if (!parsed.ok) return parsed.response;

    const { username, email, password } = parsed.data;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return jsonMessage('User with this email already exists.', 409);
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'user',
      isVerified: false,
    });

    const verificationCode = await assignVerificationCode(user);
    const response = await createSessionResponse(user, {
      message:
        'Registration successful. Check your email to verify your account.',
      status: 201,
    });

    try {
      await deliverVerificationEmail(user.email, verificationCode);
    } catch (emailError) {
      console.error('Initial verification email failed:', emailError);
    }

    return response;
  } catch (err) {
    return handleRouteError(err, 'Error during user registration:');
  }
}
