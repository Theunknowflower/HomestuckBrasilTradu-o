// js/progress.js
async function saveProgress(pageId) {
  const user = await getCurrentUser();
  if (!user) return;

  await supabase.from("progress").upsert({
    user_id: user.id,
    page_id: pageId,
    last_read_at: new Date().toISOString()
  });
}

async function loadProgress() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data } = await supabase.from("progress").select("*").eq("user_id", user.id).single();
  return data;
}
