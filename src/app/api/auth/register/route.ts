import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/mailer';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    await connectDB();

    const { username, email, password } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: 'All fields are required.' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists.' },
        { status: 409 }
      );
    }

    const verificationToken = crypto.randomUUID();
    const verificationTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      role: 'user',
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
    });

    await sendVerificationEmail(user.email, verificationToken);

    return NextResponse.json(
      { message: 'Registration successful. Please verify your email.' },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error during user registration:', err);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
