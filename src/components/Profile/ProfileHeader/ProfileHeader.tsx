'use client';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
export const ProfileHeader = () => {
  const { user, setUser } = useAuth();
  const [username, setUsername] = useState(user?.username || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const router = useRouter();

  if (!user) return null;
  const isDisabled = isLoading || (username === user.username && !avatarFile);

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
        }
      }
      setUser(updatedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setAvatarFile(null);
    setUsername('');
    router.push('/');
  };

  const handlerDisabled = () => {
    if (!username || !avatarFile) {
      return;
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 py-20 mt-[60px] w-full lg:max-w-[500px]">
      <h1 className="text-3xl font-semibold text-white">Edit Profile</h1>
      <form
        onSubmit={handleSave}
        className="flex flex-col gap-6 w-full rounded-[30px]"
      >
        <div className="flex flex-col gap-6 bg-[#141519] px-[40px] py-[30px] rounded-[20px] border border-zinc-800 shadow-lg">
          <div className="relative flex flex-col items-center justify-center text-center gap-2">
            <Avatar className="flex items-center justify-center relative w-[80px] h-[80px] overflow-hidden rounded-full bg-black border border-zinc-700">
              <AvatarImage
                className="w-full h-full object-cover cursor-pointer"
                src={preview || user.avatar}
              />
              <AvatarFallback className="text-white text-xl">
                {user?.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <input
              className="absolute opacity-0 w-[80px] h-[80px] cursor-pointer"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
            />
          </div>
          <label className="flex flex-col text-left gap-2">
            <span className="text-sm text-zinc-400">Profile Name</span>
            <div className="border-b-2 border-zinc-700 focus-within:border-[var(--color-brand-orange)] transition-colors">
              <input
                className="w-full bg-transparent text-white px-2 py-2 outline-none"
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
            <div className="border-b-2 border-zinc-800 pb-1 text-zinc-500 opacity-60 cursor-not-allowed select-none">
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
            className={`w-full h-[40px] rounded-lg bg-[var(--color-brand-orange)] text-black font-semibold hover:opacity-90 transition ${
              isDisabled
                ? 'bg-zinc-600 text-zinc-400 cursor-not-allowed opacity-50'
                : 'bg-[var(--color-brand-orange)] text-black hover:opacity-90'
            }`}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="w-full h-[40px] rounded-lg bg-zinc-700 text-white hover:bg-zinc-600 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
