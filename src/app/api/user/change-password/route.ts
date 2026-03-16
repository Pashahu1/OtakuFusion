import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { ChangePasswordBodySchema } from '@/shared/schemas/api';

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getUserFromRequest();
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { message: 'Invalid JSON body.' },
        { status: 400 }
      );
    }

    const result = ChangePasswordBodySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: 'Validation failed.', errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { oldPassword, newPassword } = result.data;
    const user = await User.findById(currentUser._id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: 'Old password is incorrect' },
        { status: 400 }
      );
    }
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Change password error:', err);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
