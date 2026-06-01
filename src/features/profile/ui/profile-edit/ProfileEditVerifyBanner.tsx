interface ProfileEditVerifyBannerProps {
  onVerify: () => void;
}

export function ProfileEditVerifyBanner({ onVerify }: ProfileEditVerifyBannerProps) {
  return (
    <div className="profile-edit__verify" role="status">
      <p>
        Confirm your email to unlock the full profile experience and keep your account
        secure.
      </p>
      <button type="button" className="profile-edit__verify-btn" onClick={onVerify}>
        Verify email
      </button>
    </div>
  );
}
