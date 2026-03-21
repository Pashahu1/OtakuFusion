'use client';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from '@/lib/toast';

const API_ERROR_FALLBACK = 'Something went wrong.';

async function messageFromResponse(res: Response): Promise<string> {
  try {
    const data: unknown = await res.json();
    if (
      data &&
      typeof data === 'object' &&
      'message' in data &&
      typeof (data as { message: unknown }).message === 'string'
    ) {
      return (data as { message: string }).message;
    }
  } catch {
    return API_ERROR_FALLBACK;
  }
  return API_ERROR_FALLBACK;
}

export const ProfileHeader = () => {
  const { user, setUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();

  if (!user) return null;
  const hasChanges = username !== user.username || avatarFile;
  const isDisabled = isLoading || !hasChanges;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let updatedUser = user;
      const usernameRes = await fetch('/api/user/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username }),
      });

      if (usernameRes.ok) {
        const data = await usernameRes.json();
        updatedUser = data.user;
        router.push('/');
      } else {
        toast.error(await messageFromResponse(usernameRes));
        return;
      }

      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const avatarRes = await fetch('/api/user/avatar', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (avatarRes.ok) {
          const data = await avatarRes.json();
          updatedUser = data.user;
          router.push('/');
        } else {
          toast.error(await messageFromResponse(avatarRes));
          return;
        }
      }
      setUser(updatedUser);
      toast.success('Profile saved.');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Не вдалося зберегти профіль';
      toast.error(message);
      console.error('Profile save error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setAvatarFile(null);
    setUsername('');
    router.push('/');
  };

  return (
    <div className="mt-[60px] flex w-full flex-col items-center gap-6 py-20 lg:max-w-[500px]">
      <h1 className="text-3xl font-semibold text-white">Edit Profile</h1>
      <form
        onSubmit={handleSave}
        className="flex w-full flex-col gap-6 rounded-[30px]"
      >
        <div className="flex flex-col gap-6 rounded-[20px] border border-zinc-800 bg-[#141519] px-[40px] py-[30px] shadow-lg">
          <div className="relative flex flex-col items-center justify-center gap-2 text-center">
            <Avatar className="relative flex h-[80px] w-[80px] items-center justify-center overflow-hidden rounded-full border border-zinc-700 bg-black">
              <AvatarImage
                className="h-full w-full cursor-pointer object-cover"
                src={preview || user.avatar}
              />
              <AvatarFallback className="text-xl text-white">
                {user?.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <input
              className="absolute h-[80px] w-[80px] cursor-pointer opacity-0"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </div>
          <label className="flex flex-col gap-2 text-left">
            <span className="text-sm text-zinc-400">Profile Name</span>
            <div className="border-b-2 border-zinc-700 transition-colors focus-within:border-[var(--color-brand-orange)]">
              <input
                className="w-full bg-transparent px-2 py-2 text-white outline-none"
                value={username}
                placeholder={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <span className="text-sm text-zinc-500">
              This is seen within your household and can be changed anytime.
            </span>
          </label>

          <div className="flex flex-col gap-2">
            <span className="text-sm text-zinc-400">Role (Optional)</span>
            <div className="cursor-not-allowed border-b-2 border-zinc-800 pb-1 text-zinc-500 opacity-60 select-none">
              Role: {user.role}
            </div>
            <span className="text-sm text-zinc-500">
              Choose your user role to be prepared for future adventures where I
              share your love of anime!
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4">
          <button
            type="submit"
            disabled={isDisabled}
            className={`h-[40px] w-full rounded-lg font-semibold transition ${isDisabled ? 'cursor-not-allowed bg-zinc-700 text-zinc-400 opacity-50' : 'bg-[var(--color-brand-orange)] text-black hover:opacity-90'} `}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="h-[40px] w-full rounded-lg bg-zinc-700 text-white transition hover:bg-zinc-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
