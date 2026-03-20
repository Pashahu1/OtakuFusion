import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { handleRouteError, unauthorizedResponse } from '@/lib/http';

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getUserFromRequest();
    if (!currentUser) {
      return unauthorizedResponse();
    }

    await User.findByIdAndDelete(currentUser._id);

    const res = NextResponse.json({ success: true });
    res.cookies.set('token', '', { expires: new Date(0) });

    return res;
  } catch (err) {
    return handleRouteError(err, 'Delete account error:');
  }
}
