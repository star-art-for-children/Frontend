import ExhibitionList from './ExhibitionList';
import LogoutButton from './LogoutButton';
import NewExhibitionBanner from './NewExhibitionBanner';
import ProfileCard from './ProfileCard';
import QuickLinks from './QuickLinks';
import type { Profile } from '@/types/profile';

interface Props {
  profile: Profile;
}

export default function MyPageScreen({ profile }: Props) {
  return (
    <main className="bg-[#f8f4ee] text-[#2d2926]">
      <div className="mx-auto w-full max-w-[1080px] px-5 py-7">
        <section className="mx-auto w-full max-w-[720px] space-y-4 pb-16">
          <ProfileCard profile={profile} />
          {profile.role === 'teacher' && <NewExhibitionBanner />}
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
