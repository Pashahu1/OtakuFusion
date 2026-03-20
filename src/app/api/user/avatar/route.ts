import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '@/lib/env';
import { handleRouteError, jsonMessage, unauthorizedResponse } from '@/lib/http';

cloudinary.config({
  cloud_name: env.CLOUDINARY_CLOUD_NAME,
  api_key: env.CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const currentUser = await getUserFromRequest();
    if (!currentUser) {
      return unauthorizedResponse();
    }
    const formData = await req.formData();
    const file = formData.get('avatar');

    if (!file || !(file instanceof File)) {
      return jsonMessage('No file provided.', 400);
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const MAX_SIZE = 10 * 1024 * 1024;
    if (buffer.length > MAX_SIZE) {
      return NextResponse.json({ message: 'File too large' }, { status: 400 });
    }

    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const type = file.type?.toLowerCase();
    if (!type || !ALLOWED_TYPES.includes(type)) {
      return jsonMessage(
        'Invalid file type. Use JPEG, PNG, WebP or GIF.',
        400
      );
    }

    interface CloudinaryUploadResult {
      secure_url: string;
    }

    const uploadResult = await new Promise<CloudinaryUploadResult>(
      (resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: 'avatars',
            public_id: `avatar_${currentUser._id}_${Date.now()}`,
            resource_type: 'image',
          },
          (error, result) => {
            if (error) reject(error);
            else if (result?.secure_url) resolve(result as CloudinaryUploadResult);
            else reject(new Error('Upload failed'));
          }
        )
        .end(buffer);
      }
    );
    const avatarUrl = uploadResult.secure_url;
    const updateUser = await User.findByIdAndUpdate(
      currentUser._id,
      { avatar: avatarUrl },
      { new: true }
    ).lean();

    return NextResponse.json({ user: updateUser }, { status: 200 });
  } catch (err) {
    return handleRouteError(err, 'Avatar upload error:');
  }
}
