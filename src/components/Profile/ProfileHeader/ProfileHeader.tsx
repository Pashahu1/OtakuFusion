'use client';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

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
  const hasChanges = username !== user.username || Boolean(avatarFile);
  const saveDisabled = isLoading || !hasChanges;

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
    <div className="mt-[60px] flex w-full flex-col items-center gap-6 py-10 sm:py-20 lg:max-w-[500px]">
      <h1 className="text-2xl font-semibold text-white sm:text-3xl">
        Edit Profile
      </h1>
      <form
        onSubmit={handleSave}
        className="flex w-full flex-col gap-6 rounded-[30px]"
      >
        <div className="flex flex-col gap-6 rounded-[20px] border border-zinc-800 bg-[#141519] px-5 py-6 shadow-lg sm:px-10 sm:py-8 md:px-[40px] md:py-[30px]">
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
        <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:flex-row-reverse sm:justify-start sm:gap-3">
          <button
            type="submit"
            disabled={saveDisabled}
            className={cn(
              'h-11 w-full touch-manipulation rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-orange-light)] focus-visible:ring-offset-2 focus-visible:ring-offset-[#141519] sm:min-w-[8.5rem] sm:flex-1',
              isLoading &&
                'cursor-wait border border-transparent bg-[var(--color-brand-orange)] text-[var(--color-brand-text-primary)] opacity-90 shadow-md shadow-[var(--color-brand-orange-light)]/35',
              !isLoading &&
                hasChanges &&
                'border border-transparent bg-[var(--color-brand-orange)] text-[var(--color-brand-text-primary)] shadow-md shadow-[var(--color-brand-orange-light)]/35 hover:bg-[var(--color-brand-orange-light)] active:scale-[0.99]',
              !isLoading &&
                !hasChanges &&
                'cursor-not-allowed border border-zinc-700/90 bg-transparent text-zinc-500 shadow-none hover:bg-transparent',
            )}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="h-11 w-full touch-manipulation rounded-lg border border-zinc-600 bg-transparent px-4 text-sm font-semibold text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-800/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-brand-orange)]/35 focus-visible:ring-offset-2 focus-visible:ring-offset-[#141519] sm:min-w-[8.5rem] sm:flex-1"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
