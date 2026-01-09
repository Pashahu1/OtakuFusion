import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import User from '@/models/User';
import { connectDB } from './db';

interface TokenPayload extends jwt.JwtPayload {
  id: string;
}

export async function getUserFromRequest() {
  await connectDB();

  const cookieStore = await cookies();
  const token = cookieStore.get('accessToken')?.value;

  if (!token) return null;

  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET!) as TokenPayload;
    const user = await User.findById(payload.id).lean();
    return user;
  } catch {
    return null;
  }
}
