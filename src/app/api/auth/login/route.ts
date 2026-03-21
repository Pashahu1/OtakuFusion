import bcrypt from 'bcryptjs';
import User from '@/models/User';
import { connectDB } from '@/lib/db';
import { createSessionResponse } from '@/lib/auth-session-response';
import { LoginBodySchema } from '@/shared/schemas/api';
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

    const parsed = parseWithSchema(LoginBodySchema, json.data);
    if (!parsed.ok) return parsed.response;

    const { email, password } = parsed.data;
    const user = await User.findOne({ email });

    if (!user) {
      return jsonMessage('Invalid email or password.', 404);
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return jsonMessage('Invalid email or password.', 401);
    }

    // Email може бути ще не підтверджений — сесію все одно видаємо (верифікація опційна).
    return createSessionResponse(user, {
      message: 'Login successful',
      status: 200,
    });
  } catch (err) {
    return handleRouteError(err, 'Login error:');
  }
}
