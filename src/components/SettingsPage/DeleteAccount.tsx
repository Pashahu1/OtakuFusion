'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function DeleteAccount() {
  const [confirm, setConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    try {
      setLoading(true);

      const res = await fetch('/api/user/delete-account', {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete account');
      }

      localStorage.clear();
      window.location.href = '/';
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
    flex flex-col gap-5 p-6
    bg-[#1d1f24]/80 backdrop-blur-md
    rounded-xl border border-red-500/20
    shadow-[0_8px_30px_rgba(255,0,0,0.15)]
    transition-all duration-300
  "
    >
      <h2 className="text-2xl font-semibold text-red-400 tracking-wide">
        Delete Account
      </h2>

      <p className="text-sm text-white/70 leading-relaxed">
        This action is{' '}
        <span className="text-red-400 font-semibold">permanent</span>. Your
        account and all associated data will be removed.
      </p>

      {!confirm ? (
        <button
          onClick={() => setConfirm(true)}
          className="
          h-[40px] w-full rounded-md font-medium
          bg-red-600/90 hover:bg-red-600
          text-white shadow-[0_4px_15px_rgba(255,0,0,0.3)]
          transition-all duration-200
          hover:shadow-[0_6px_20px_rgba(255,0,0,0.45)]
        "
        >
          Delete my account
        </button>
      ) : (
        <div className="flex flex-col gap-4 mt-2">
          <p className="text-white/80 text-[15px]">
            Are you absolutely sure you want to delete your account?
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleDelete}
              disabled={loading}
              className="
              h-[40px] w-[120px]  rounded-md font-medium
              bg-red-600 hover:bg-red-700
              text-white
              disabled:opacity-50
              shadow-[0_4px_15px_rgba(255,0,0,0.3)]
              hover:shadow-[0_6px_20px_rgba(255,0,0,0.45)]
              transition-all duration-200
            "
            >
              {loading ? 'Deleting...' : 'Yes, delete'}
            </button>

            <button
              onClick={() => setConfirm(false)}
              className="
              h-[40px] w-[70px] rounded-md font-medium
              bg-gray-600/80 hover:bg-gray-600
              text-white
              shadow-[0_4px_15px_rgba(0,0,0,0.25)]
              transition-all duration-200
            "
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
