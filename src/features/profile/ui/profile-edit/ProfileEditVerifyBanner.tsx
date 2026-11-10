import { useTranslation } from 'react-i18next';

interface ProfileEditVerifyBannerProps {
  onVerify: () => void;
}

export function ProfileEditVerifyBanner({ onVerify }: ProfileEditVerifyBannerProps) {
  const { t } = useTranslation('common');

  return (
    <div className="profile-edit__verify" role="status">
      <p>{t('profile.verifyBanner')}</p>
      <button type="button" className="profile-edit__verify-btn" onClick={onVerify}>
        {t('profile.verifyEmail')}
      </button>
    </div>
  );
}
