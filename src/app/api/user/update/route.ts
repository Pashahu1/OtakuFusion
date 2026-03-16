import { NextRequest, NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { UpdateUserBodySchema } from '@/shared/schemas/api';

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

    const result = UpdateUserBodySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: 'Validation failed.', errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { username } = result.data;
    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      { username },
      { new: true }
    ).lean();
    return NextResponse.json({ user: updatedUser }, { status: 200 });
  } catch (error) {
    console.error('Update username error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
