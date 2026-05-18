import ProfileEditDialog from '@/components/myPage/ProfileEditDialog';
import type { Profile } from '@/types/myPage';

interface ProfileCardProps {
  profile: Profile;
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const roleLabel = profile.role === 'teacher' ? '선생님' : '일반 사용자';
  const roleClass =
    profile.role === 'teacher'
      ? 'bg-[#fff4d9] text-[#d5981f]'
      : 'bg-[#fff1f1] text-[#df6b6b]';

  return (
    <section className="rounded-[26px] border border-[#e8e1d7] bg-white px-9 py-7 shadow-[0_2px_8px_rgba(64,48,33,0.04)]">
      <div className="flex items-start gap-5">
        {/* 아바타 */}
        <div className="flex h-[68px] w-[68px] items-center justify-center rounded-[20px] bg-gradient-to-br from-[#f5bf45] to-[#ff8f74] text-[22px] font-bold text-white">
          {profile.name.slice(0, 1)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-3">
            <h1 className="text-[18px] font-bold text-[#2b2724]">
              {profile.name}
            </h1>
            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${roleClass}`}
            >
              {profile.role === 'teacher' ? '🎨' : '👤'} {roleLabel}
            </span>
          </div>
          <p className="text-[14px] text-[#827b73]">{profile.email}</p>

          {/* 학원명은 선생님 계정에서만 보여주기 */}
          {profile.role === 'teacher' && (
            <p className="mt-1 text-[13px] text-[#9b948c]">
              🏫 {profile.academy_name}
            </p>
          )}
        </div>

        <ProfileEditDialog profile={profile} />
      </div>
    </section>
  );
}
