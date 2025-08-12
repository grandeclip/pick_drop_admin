import { createClient } from "@supabase/supabase-js";

// 환경 변수에서 Supabase URL과 키를 가져옴
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;

// 클라이언트 사이드용 Supabase 클라이언트 (anon key 사용)
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// 서버 컴포넌트용 Supabase 클라이언트 (service role key 사용)
export const createServerSupabaseClient = () => {
  return createClient(supabaseUrl, supabaseServiceKey);
};
