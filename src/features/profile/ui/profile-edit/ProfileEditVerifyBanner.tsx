interface ProfileEditVerifyBannerProps {
  onVerify: () => void;
}

export function ProfileEditVerifyBanner({ onVerify }: ProfileEditVerifyBannerProps) {
  return (
    <div className="profile-edit__verify" role="status">
      <p>
        Verify your email when you are ready — it keeps your account secure and unlocks extra
        features later.
      </p>
      <button type="button" className="profile-edit__verify-btn" onClick={onVerify}>
        Verify email
      </button>
    </div>
  );
}
