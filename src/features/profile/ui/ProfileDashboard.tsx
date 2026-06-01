'use client';

import { InitialLoader } from '@/components/ui/InitialLoader/InitialLoader';
import { useAuth } from '@/context/AuthContext';
import { useProfileDashboard } from '../hooks/useProfileDashboard';
import { ProfileActivityFeed } from './ProfileActivityFeed';
import { ProfileGenreOverview } from './ProfileGenreOverview';
import { ProfileHeatmap } from './ProfileHeatmap';
import { ProfileStatsCards } from './ProfileStatsCards';

export function ProfileDashboard() {
  const { user } = useAuth();
  const { dashboard, hydrated } = useProfileDashboard(Boolean(user));

  if (!user) return null;

  if (!hydrated) {
    return (
      <div className="profile-dashboard profile-dashboard--loading">
        <InitialLoader />
      </div>
    );
  }

  return (
    <div className="profile-dashboard">
      <div className="profile-dashboard__main">
        <ProfileHeatmap cells={dashboard.heatmap} />
        <ProfileGenreOverview genres={dashboard.genres} />
      </div>
      <aside className="profile-dashboard__aside">
        <ProfileStatsCards stats={dashboard.stats} />
        <ProfileActivityFeed activity={dashboard.activity} />
      </aside>
    </div>
  );
}
