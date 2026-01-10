import { NextRequest, NextResponse } from 'next/server';
// import fs from 'fs/promises';
// import path from 'path';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const currentUser = await getUserFromRequest();
    if (!currentUser) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    const formData = await req.formData();
    const file = formData.get('avatar');

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const MAX_SIZE = 10 * 1024 * 1024;
    if (buffer.length > MAX_SIZE) {
      return NextResponse.json({ message: 'File too large' }, { status: 400 });
    }
    const uploadResult: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'avatars',
            public_id: `avatar_${currentUser._id}_${Date.now()}`,
            resource_type: 'image',
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        )
        .end(buffer);
    });
    // const ext = file.name.split('.').pop() || 'png';
    // const fileName = `avatar_${currentUser._id}_${Date.now()}.${ext}`;

    // const uploadDir = path.join(process.cwd(), 'public', 'avatars');
    // await fs.mkdir(uploadDir, { recursive: true });
    // const filePath = path.join(uploadDir, fileName);
    // await fs.writeFile(filePath, buffer);
    const avatarUrl = uploadResult.secure_url;
    const updateUser = await User.findByIdAndUpdate(
      currentUser._id,
      { avatar: avatarUrl },
      { new: true }
    ).lean();

    return NextResponse.json({ user: updateUser }, { status: 200 });
  } catch (err) {
    console.error('Avatar upload error:', err);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
