// fanarts.js

async function loadFanarts() {
  const { data, error } = await supabase
    .from("fanarts")
    .select("*")
    .order("created_at", { ascending: false });

  const container = document.getElementById("fanarts");

  if (error) {
    container.innerHTML = "Erro ao carregar fanarts.";
    return;
  }

  container.innerHTML = data.length
    ? data.map(f => `
      <div class="fanart">
        <strong>${f.title}</strong>
        <p>${f.description ?? ""}</p>
        ${f.image_url ? `<img src="${f.image_url}" style="max-width:100%">` : ""}
      </div>
    `).join("")
    : "Nenhuma fanart enviada.";
}

async function submitFanart() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert("Você precisa estar logado.");

  const title = document.getElementById("fanartTitle").value.trim();
  const desc = document.getElementById("fanartDesc").value.trim();
  const img = document.getElementById("fanartImg").value.trim();

  const { error } = await supabase.from("fanarts").insert([{ 
    user_id: user.id, title, description: desc, image_url: img 
  }]);

  if (error) {
    alert("Erro ao publicar: " + error.message);
    return;
  }

  alert("Fanart publicada!");
  loadFanarts();
}
