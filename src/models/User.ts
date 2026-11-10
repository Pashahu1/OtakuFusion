import mongoose from 'mongoose';

const ContinueWatchingEntrySchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    data_id: { type: Number, required: true },
    episodeId: { type: String, required: true },
    episodeNum: { type: Number },
    poster: { type: String },
    title: { type: String },
    japanese_title: { type: String },
    adultContent: { type: Boolean },
    genres: { type: [String], default: undefined },
    positionSeconds: { type: Number },
    durationSeconds: { type: Number },
    updatedAt: { type: Number },
    watchStreamProvider: { type: String, enum: ['hikka', 'anikoto'] },
    streamLang: { type: String, enum: ['sub', 'dub'] },
  },
  { _id: false },
);

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    avatar: { type: String },
    refreshToken: { type: String, default: null },
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String, default: null },
    verificationCodeExpires: { type: Date, default: null },
    favoriteAnimeIds: { type: [String], default: [] },
    continueWatching: { type: [ContinueWatchingEntrySchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model('User', UserSchema);
