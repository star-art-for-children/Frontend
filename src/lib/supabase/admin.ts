import { createClient } from '@supabase/supabase-js';

// 서버 전용. service role 키 사용 → RLS 우회. 절대 클라이언트에서 import 금지.
export const createAdminClient = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
