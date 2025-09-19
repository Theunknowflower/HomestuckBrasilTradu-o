import { supabase, getUser } from "./supabase.js";

export async function savePage(pageNumber) {
  const user = await getUser();
  if (!user) throw new Error("Usuário não logado");

  const { error } = await supabase.from("progress").upsert({
    user_id: user.id,
    page: pageNumber,
    updated_at: new Date().toISOString()
  });

  if (error) throw error;
}

export async function loadProgress() {
  const user = await getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from("progress")
    .select("page")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) throw error;
  return data.length ? data[0].page : null;
}
