import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [key, ...res] = c.trim().split('=');
      return [key, decodeURIComponent(res.join('='))];
    })
  );

  const accessToken = cookies['accessToken'];

  if (!accessToken) {
    return NextResponse.json({ user: null });
  }

  try {
    const payLoad = jwt.verify(
      accessToken,
      process.env.JWT_ACCESS_SECRET!
    ) as any;

    return NextResponse.json({
      user: {
        id: payLoad.id,
        email: payLoad.email,
        role: payLoad.role,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}
