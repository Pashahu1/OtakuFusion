import { NextRequest, NextResponse } from 'next/server';

import { getUserFromRequest } from '@/lib/auth';
import {
  type SessionUserDoc,
  userToClientPayload,
} from '@/lib/auth-session-response';
import { connectDB } from '@/lib/db';
import {
  handleRouteError,
  jsonMessage,
  parseWithSchema,
  readJsonBody,
  unauthorizedResponse,
} from '@/lib/http';
import User from '@/models/User';
import { resolvePresetAvatarSrc } from '@/shared/constants/preset-avatars';
import { PresetAvatarBodySchema } from '@/shared/schemas/api';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getUserFromRequest();
    if (!currentUser) {
      return unauthorizedResponse();
    }

    const json = await readJsonBody(req);
    if (!json.ok) return json.response;

    const parsed = parseWithSchema(PresetAvatarBodySchema, json.data);
    if (!parsed.ok) return parsed.response;

    const avatarSrc = resolvePresetAvatarSrc(parsed.data.presetId);
    if (!avatarSrc) {
      return jsonMessage('Unknown preset avatar.', 400);
    }

    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      { avatar: avatarSrc },
      { new: true },
    ).lean();

    return NextResponse.json(
      { user: userToClientPayload(updatedUser as unknown as SessionUserDoc) },
      { status: 200 },
    );
  } catch (err) {
    return handleRouteError(err, 'Preset avatar error:');
  }
}
