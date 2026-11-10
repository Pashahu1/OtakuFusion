import { z } from 'zod';


export const LoginBodySchema = z.object({
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
});

export const RegisterBodySchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});


export const RegisterPageFormSchema = z
  .object({
    username: z
      .string()
      .min(1, 'Please fill in all fields.')
      .min(3, 'Username must be at least 3 characters.')
      .regex(
        /^[a-zA-Z0-9_]+$/,
        'Username can contain only letters, numbers and underscores.'
      ),
    email: z
      .string()
      .min(1, 'Please fill in all fields.')
      .email('Invalid email format.'),
    password: z
      .string()
      .min(1, 'Please fill in all fields.')
      .min(6, 'Password must be at least 6 characters.')
      .refine(
        (p) => /[A-Za-z]/.test(p) && /[0-9]/.test(p),
        'Password must contain letters and numbers.'
      ),
    confirm: z.string().min(1, 'Please fill in all fields.'),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'Passwords do not match.',
    path: ['confirm'],
  });

export const ChangePasswordBodySchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export const UpdateUserBodySchema = z.object({
  username: z.string().min(1, 'Username is required'),
});

export const PresetAvatarBodySchema = z.object({
  presetId: z
    .string()
    .min(1, 'Preset id is required')
    .regex(/^\d{2}$/, 'Invalid preset id.'),
});

export const FavoriteAnimeBodySchema = z.object({
  animeId: z.string().min(1, 'Anime id is required'),
});

export const ContinueWatchingEntrySchema = z.object({
  id: z.string().min(1).max(64),
  data_id: z.number().int().positive(),
  episodeId: z.string().min(1).max(128),
  episodeNum: z.number().int().nonnegative().optional(),
  poster: z.string().max(2000).optional(),
  title: z.string().max(500).optional(),
  japanese_title: z.string().max(500).optional(),
  adultContent: z.boolean().optional(),
  genres: z.array(z.string().max(80)).max(20).optional(),
  positionSeconds: z.number().nonnegative().max(86_400).optional(),
  durationSeconds: z.number().positive().max(86_400).optional(),
  updatedAt: z.number().int().nonnegative().optional(),
  watchStreamProvider: z.enum(['hikka', 'anikoto']).optional(),
  streamLang: z.enum(['sub', 'dub']).optional(),
});

export const ContinueWatchingPutSchema = z.union([
  z.object({ entry: ContinueWatchingEntrySchema }),
  z.object({ entries: z.array(ContinueWatchingEntrySchema).max(40) }),
]);

export type LoginBody = z.infer<typeof LoginBodySchema>;
export type RegisterBody = z.infer<typeof RegisterBodySchema>;
export type ChangePasswordBody = z.infer<typeof ChangePasswordBodySchema>;
export type UpdateUserBody = z.infer<typeof UpdateUserBodySchema>;
export type FavoriteAnimeBody = z.infer<typeof FavoriteAnimeBodySchema>;
export type ContinueWatchingEntryBody = z.infer<typeof ContinueWatchingEntrySchema>;
export type ContinueWatchingPutBody = z.infer<typeof ContinueWatchingPutSchema>;
