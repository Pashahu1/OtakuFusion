'use client';

import Link from 'next/link';
import { Pencil, Shield } from 'lucide-react';

export function ProfileSettingsSecurityAside() {
  return (
    <aside className="profile-settings__card profile-panel profile-settings__aside">
      <div className="profile-settings__card-head">
        <span className="profile-settings__card-icon" aria-hidden>
          <Shield size={18} />
        </span>
        <div>
          <h3 className="profile-settings__card-title">Security tips</h3>
          <p className="profile-settings__card-desc">
            Keep your OtakuFusion account safe.
          </p>
        </div>
      </div>

      <ul className="profile-settings__tips">
        <li>Use a password you do not reuse on other sites.</li>
        <li>Change your password if you sign in on a shared device.</li>
        <li>Verify your email so you can recover access later.</li>
      </ul>

      <Link href="/profile/manage" className="profile-settings__link-row">
        <Pencil aria-hidden size={16} />
        <span>Edit profile & avatar</span>
      </Link>
    </aside>
  );
}
