import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import User from '@/models/User';
import { connectDB } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';

export async function PATCH(req: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getUserFromRequest();

    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { username } = await req.json();
    if (!username || typeof username !== 'string') {
      return NextResponse.json(
        { message: 'Invalid username' },
        { status: 400 }
      );
    }
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
