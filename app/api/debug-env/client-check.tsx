'use client';

export function ClientEnvCheck() {
  if (typeof window !== 'undefined') {
    console.log('[Client] NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  }
  return null;
}
