'use client';

import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="text-center mt-20 text-lg">Loading...</div>;
  }

  if (!user) {
    return <div className="text-center mt-20 text-lg">You are not author</div>;
  }

  return (
    <div className="max-w-xl mx-auto mt-20 p-6 border rounded-xl shadow-sm bg-grey dark:bg-neutral-900">
      <div className="flex items-center gap-4">
        <Avatar className="w-20 h-20">
          {/* <AvatarImage src={user.avatar || ''} /> */}
          <AvatarFallback>{user.email[0].toUpperCase()}</AvatarFallback>
        </Avatar>

        <div>
          <h1 className="text-2xl font-bold">{user.email}</h1>
          <p className="text-gray-500">Role: {user.role}</p>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-500">
        Account Created: <span className="font-medium">Not realised</span>
      </div>
    </div>
  );
}
