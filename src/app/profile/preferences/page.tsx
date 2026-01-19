import ChangePasswordForm from '@/components/SettingsPage/ChangePasswordForm';
import DeleteAccount from '@/components/SettingsPage/DeleteAccount';

export default function SettingsProfile() {
  return (
    <div className="flex flex-col gap-10 w-full max-w-2xl mx-auto py-10">
      <ChangePasswordForm />
      <DeleteAccount />
    </div>
  );
}
