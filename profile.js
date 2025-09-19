// comments.js

async function loadComments() {
  const { data, error } = await supabase
    .from("comments")
    .select("*")
    .order("created_at", { ascending: false });

  const container = document.getElementById("commentSection");

  if (error) {
    container.innerHTML = "<div style='color:red'>Erro ao carregar comentários.</div>";
    console.error(error);
    return;
  }

  container.innerHTML = data.map(c => `
    <div class="comment">
      <strong>${c.user ?? "Anônimo"}</strong> — ${timeAgo(c.created_at)}<br>
      ${c.text}
    </div>
  `).join("");
}

async function addComment() {
  const textarea = document.getElementById("newComment");
  const text = textarea.value.trim();
  if (!text) return;

  const { data: { user } } = await supabase.auth.getUser();
  const username = user ? user.email : "Convidado";

  const { error } = await supabase.from("comments").insert([{ user: username, text }]);

  if (error) {
    console.error(error);
    return;
  }

  textarea.value = "";
  loadComments();
}

function subscribeToComments() {
  supabase.channel("comments-channel")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "comments" }, payload => {
      const list = document.getElementById("commentSection");
      const c = payload.new;
      const div = document.createElement("div");
      div.innerHTML = `<strong>${c.user ?? "Anônimo"}</strong> — ${timeAgo(c.created_at)}<br>${c.text}`;
      list.prepend(div);
    })
    .subscribe();
}

function timeAgo(dateString) {
  const date = new Date(dateString);
  const diff = (new Date() - date) / 1000;
  if (diff < 60) return "agora";
  if (diff < 3600) return Math.floor(diff / 60) + " min atrás";
  if (diff < 86400) return Math.floor(diff / 3600) + " h atrás";
  return date.toLocaleDateString("pt-BR");
}

