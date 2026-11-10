import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

interface ProfileEditFormActionsProps {
  hasChanges: boolean;
  isLoading: boolean;
  saveDisabled: boolean;
  onDiscard: () => void;
}

export function ProfileEditFormActions({
  hasChanges,
  isLoading,
  saveDisabled,
  onDiscard,
}: ProfileEditFormActionsProps) {
  const { t } = useTranslation('common');

  return (
    <div
      className={cn(
        'profile-edit__actions',
        hasChanges && 'profile-edit__actions--visible',
      )}
    >
      <button
        type="button"
        className="profile-edit__btn profile-edit__btn--ghost"
        onClick={onDiscard}
        disabled={isLoading || !hasChanges}
      >
        {t('actions.discard')}
      </button>
      <button
        type="submit"
        className="profile-edit__btn profile-edit__btn--primary"
        disabled={saveDisabled}
      >
        {isLoading ? t('actions.saving') : t('actions.save')}
      </button>
    </div>
  );
}
