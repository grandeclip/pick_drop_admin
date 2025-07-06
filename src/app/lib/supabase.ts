import { createClient } from "@supabase/supabase-js";

// 환경 변수에서 Supabase URL과 키를 가져옴
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 클라이언트 사이드용 Supabase 클라이언트 (읽기 전용)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 서버 컴포넌트용 Supabase 클라이언트 (읽기 전용)
export const createServerSupabaseClient = () => {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!
  );
};
