import ExhibitionList from '@/components/myPage/ExhibitionList';
import LogoutButton from '@/components/myPage/LogoutButton';
import NewExhibitionBanner from '@/components/myPage/NewExhibitionBanner';
import ProfileCard from '@/components/myPage/ProfileCard';
import QuickLinks from '@/components/myPage/QuickLinks';
import type { Profile } from '@/types/myPage';

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
