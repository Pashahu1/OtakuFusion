import { cookies } from 'next/headers';
import User from '@/models/User';
import { connectDB } from './db';
import { env } from '@/lib/env';
import { verifyAccessTokenId } from '@/lib/jwt';

export async function getUserFromRequest() {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) return null;

  const id = await verifyAccessTokenId(token, env.NEXT_JWT_ACCESS_SECRET);
  if (!id) return null;

  return User.findById(id).lean();
}
