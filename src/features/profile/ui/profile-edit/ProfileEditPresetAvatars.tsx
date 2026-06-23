import Image from 'next/image';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { PRESET_AVATAR_GROUPS } from '@/shared/constants/preset-avatars';

interface ProfileEditPresetAvatarsProps {
  selectedSrc: string | null;
  currentAvatarSrc: string;
  disabled: boolean;
  onSelect: (src: string) => void;
}

export function ProfileEditPresetAvatars({
  selectedSrc,
  currentAvatarSrc,
  disabled,
  onSelect,
}: ProfileEditPresetAvatarsProps) {
  const activeSrc = selectedSrc ?? currentAvatarSrc;

  return (
    <div className="profile-edit__picker">
      <div className="profile-edit__picker-head">
        <h4 className="profile-edit__picker-title">Choose your avatar</h4>
        <p className="profile-edit__picker-subtitle">
          Pick a character icon — streaming-style profiles, like Netflix or Disney+.
        </p>
      </div>

      <div className="profile-edit__picker-groups">
        {PRESET_AVATAR_GROUPS.map((group) => (
          <section key={group.id} className="profile-edit__picker-group">
            <h5 className="profile-edit__picker-series">{group.title}</h5>
            <div className="profile-edit__picker-grid">
              {group.avatars.map((preset) => {
                const isActive = activeSrc === preset.src;

                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={cn(
                      'profile-edit__picker-item',
                      isActive && 'profile-edit__picker-item--active',
                    )}
                    disabled={disabled}
                    aria-label={`${preset.label} from ${group.title}`}
                    aria-pressed={isActive}
                    onClick={() => onSelect(preset.src)}
                  >
                    <span className="profile-edit__picker-avatar-wrap">
                      <Image
                        src={preset.src}
                        alt=""
                        width={88}
                        height={88}
                        className="profile-edit__picker-avatar"
                        unoptimized
                      />
                      {isActive ? (
                        <span className="profile-edit__picker-check" aria-hidden>
                          <Check size={14} strokeWidth={3} />
                        </span>
                      ) : null}
                    </span>
                    <span className="profile-edit__picker-name">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
