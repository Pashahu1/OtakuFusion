import { connectDB } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/mailer';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { createSessionResponse } from '@/lib/auth-session-response';
import { RegisterBodySchema } from '@/shared/schemas/api';
import {
  handleRouteError,
  jsonMessage,
  parseWithSchema,
  readJsonBody,
} from '@/lib/http';

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
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'user',
      isVerified: false,
      verificationCode,
      verificationCodeExpires,
    });

    await sendVerificationEmail(user.email, verificationCode);

    return createSessionResponse(user, {
      message: 'Registration successful. Check your email to verify your account.',
      status: 201,
    });
  } catch (err) {
    return handleRouteError(err, 'Error during user registration:');
  }
}
