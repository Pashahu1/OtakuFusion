import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function DELETE(req: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getUserFromRequest();
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    await User.findByIdAndDelete(currentUser._id);

    const res = NextResponse.json({ success: true });
    res.cookies.set('token', '', { expires: new Date(0) });

    return res;
  } catch (err) {
    console.error('Delete account error:', err);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
