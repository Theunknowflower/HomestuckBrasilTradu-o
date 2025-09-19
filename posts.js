// js/posts.js
async function loadCommunityPosts() {
  const container = document.getElementById("communityPosts");
  const { data, error } = await supabase.from("posts").select(`
    id, title, content, image_url, created_at,
    profiles ( username )
  `).order("created_at", { ascending: false });

  if (error) {
    container.innerHTML = "Erro ao carregar posts.";
    return;
  }

  container.innerHTML = data.map(p => `
    <div class="card">
      <h4>${p.title}</h4>
      <p>${p.content || ""}</p>
      ${p.image_url ? `<img src="${p.image_url}" style="max-width:100%">` : ""}
      <small>por @${p.profiles?.username || "anônimo"} — ${new Date(p.created_at).toLocaleString()}</small>
    </div>
  `).join("");
}

async function submitPost() {
  const user = await getCurrentUser();
  if (!user) return alert("Você precisa estar logado!");

  const title = document.getElementById("postTitle").value.trim();
  const content = document.getElementById("postContent").value.trim();
  const image_url = document.getElementById("postImage").value.trim();

  const { error } = await supabase.from("posts").insert([{ user_id: user.id, title, content, image_url }]);
  if (error) return alert("Erro: " + error.message);

  loadCommunityPosts();
}
