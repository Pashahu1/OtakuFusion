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
        Discard
      </button>
      <button
        type="submit"
        className="profile-edit__btn profile-edit__btn--primary"
        disabled={saveDisabled}
      >
        {isLoading ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  );
}
