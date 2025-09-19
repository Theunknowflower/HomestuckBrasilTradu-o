// js/comments.js
async function loadComments() {
  const container = document.getElementById("commentList");
  const { data, error } = await supabase.from("comments").select("*").order("created_at", { ascending: false });

  if (error) return container.innerHTML = "Erro ao carregar comentários.";

  container.innerHTML = data.map(c => `
    <div class="comment">
      <strong>${c.user}</strong> — ${new Date(c.created_at).toLocaleString()}
      <p>${c.text}</p>
    </div>
  `).join("");
}

async function addComment() {
  const user = await getCurrentUser();
  const text = document.getElementById("newComment").value.trim();
  if (!text) return;

  await supabase.from("comments").insert([{ user: user?.email || "Anônimo", text }]);
  document.getElementById("newComment").value = "";
  loadComments();
}
