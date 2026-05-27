import 'server-only';

import { cache } from 'react';
import type { User } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';

// getUser()로 가져오는 유저 프로필 데이터 타입
export type AuthProfile = {
  username: string | null;
  role: string | null;
  institution: string | null;
};

// AuthContext 반환 데이터 타입
export type AuthContext = {
  user: User | null;
  profile: AuthProfile | null;
};

// 한 번의 요청 사이클에서 맨 처음 getUser() 함수 결과값을 캐싱하고 이후엔 캐싱된 값을 반환하는 함수
export const getAuthContext = cache(async (): Promise<AuthContext> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      user: null,
      profile: null,
    };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, role, institution')
    .eq('id', user.id)
    .maybeSingle<AuthProfile>();

  return {
    user,
    profile,
  };
});
