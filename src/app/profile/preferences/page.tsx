import { ChangePasswordForm } from '@/components/SettingsPage/ChangePasswordForm';
import { DeleteAccount } from '@/components/SettingsPage/DeleteAccount';

export default function SettingsProfile() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-10 py-10">
      <ChangePasswordForm />
      <DeleteAccount />
    </div>
  );
}
