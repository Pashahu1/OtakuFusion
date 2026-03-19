import mongoose from 'mongoose';
import { env } from '@/lib/env';
export const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }

    await mongoose.connect(env.MONGODB_URI);
  } catch (error) {
    console.error('MongoDB connection error:', error);
  }
};
