import AchievementSection from './AchievementSection';
import CreditCard from './CreditCard';
import ExhibitionList from './ExhibitionList';
import LogoutButton from './LogoutButton';
import NewExhibitionBanner from './NewExhibitionBanner';
import ProfileCard from './ProfileCard';
import QuickLinks from './QuickLinks';
import type { Profile } from '@/types/profile';
import type { UserAchievementResult } from '@/lib/achievements/server';

interface Props {
  profile: Profile;
  achievement: UserAchievementResult;
  balance: number;
}

export default function MyPageScreen({ profile, achievement, balance }: Props) {
  return (
    <main className="bg-[#f8f4ee] text-[#2d2926]">
      <div className="mx-auto w-full max-w-[1080px] px-5 py-7">
        <section className="mx-auto w-full max-w-[720px] space-y-4 pb-16">
          <ProfileCard profile={profile} />
          {profile.role === 'teacher' && (
            <>
              <CreditCard balance={balance} />
              <NewExhibitionBanner />
            </>
          )}
          <AchievementSection
            achievements={achievement.achievements}
            clearedCount={achievement.clearedCount}
            selectedTitle={profile.selectedTitle}
          />
          <QuickLinks />
          {profile.role === 'teacher' && (
            <ExhibitionList exhibitions={profile.exhibitions} />
          )}
          <LogoutButton />
        </section>
      </div>
    </main>
  );
}
