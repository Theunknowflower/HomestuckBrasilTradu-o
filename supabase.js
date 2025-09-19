async function savePage() {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) {
    alert("Você precisa estar logado para salvar o progresso!");
    return;
  }

  const pageMeta = document.getElementById("pageMeta").innerText;
  const match = pageMeta.match(/Página (\d+)/);
  const pageNumber = match ? parseInt(match[1]) : 1;

  const { error } = await supabase
    .from("progress")
    .upsert({
      user_id: user.id,
      page: pageNumber,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error(error);
    alert("Erro ao salvar progresso!");
  } else {
    alert("Progresso salvo!");
  }
}
async function loadProgress() {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return;

  const { data, error } = await supabase
    .from("progress")
    .select("page")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (data && data.length > 0) {
    openPage(data[0].page);
  }
}
function subscribeToProgress() {
  const userPromise = supabase.auth.getUser();

  userPromise.then(({ data: { user } }) => {
    if (!user) return;

    supabase
      .channel('progress-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'progress', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log("Progresso atualizado:", payload.new);
          openPage(payload.new.page);
        }
      )
      .subscribe();
  });
}
