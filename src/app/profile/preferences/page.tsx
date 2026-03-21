import { ChangePasswordForm } from '@/components/SettingsPage/ChangePasswordForm';
import { DeleteAccount } from '@/components/SettingsPage/DeleteAccount';

export default function SettingsProfile() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-8 sm:gap-10 sm:py-10 md:px-0">
      <ChangePasswordForm />
      <DeleteAccount />
    </div>
  );
}
