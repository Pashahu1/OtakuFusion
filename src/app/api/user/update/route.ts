import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { UpdateUserBodySchema } from '@/shared/schemas/api';
import {
  handleRouteError,
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

    const parsed = parseWithSchema(UpdateUserBodySchema, json.data);
    if (!parsed.ok) return parsed.response;

    const { username } = parsed.data;
    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      { username },
      { new: true }
    ).lean();
    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    return handleRouteError(error, 'Update username error:');
  }
}
