import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { ChangePasswordBodySchema } from '@/shared/schemas/api';
import {
  handleRouteError,
  jsonMessage,
  parseWithSchema,
  readJsonBody,
  unauthorizedResponse,
} from '@/lib/http';

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getUserFromRequest();
    if (!currentUser) {
      return unauthorizedResponse();
    }

    const json = await readJsonBody(req);
    if (!json.ok) return json.response;

    const parsed = parseWithSchema(ChangePasswordBodySchema, json.data);
    if (!parsed.ok) return parsed.response;

    const { oldPassword, newPassword } = parsed.data;
    const user = await User.findById(currentUser._id);
    if (!user) {
      return jsonMessage('User not found.', 404);
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return jsonMessage('Old password is incorrect.', 400);
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    return handleRouteError(err, 'Change password error:');
  }
}
