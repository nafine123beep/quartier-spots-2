import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  return (
    <main style={{ padding: 24 }}>
      <pre>{JSON.stringify({ user: data?.user ?? null, error: error?.message ?? null }, null, 2)}</pre>
    </main>
  );
}
