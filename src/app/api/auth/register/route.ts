import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { sendVerificationEmail } from '@/lib/mailer';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { RegisterBodySchema } from '@/shared/schemas/api';

export async function POST(req: Request) {
  try {
    await connectDB();

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { message: 'Invalid JSON body.' },
        { status: 400 }
      );
    }

    const result = RegisterBodySchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: 'Validation failed.', errors: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { username, email, password } = result.data;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: 'User with this email already exists.' },
        { status: 409 }
      );
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = Math.floor(
      100000 + Math.random() * 900000
    ).toString();
    const verificationCodeExpires = new Date(Date.now() + 10 * 60 * 1000);
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      role: 'user',
      isVerified: false,
      verificationCode,
      verificationCodeExpires,
    });

    await sendVerificationEmail(user.email, verificationCode);

    return NextResponse.json(
      { message: 'Registration successful. Please verify your email.', email },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    console.error('Error during user registration:', err);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
