// abrir modal
function openModal(id) {
  document.getElementById(id + "Modal").style.display = "flex";
  if (id === "community") loadCommunityPosts();
}

// fechar modal
function closeModal(id) {
  document.getElementById(id + "Modal").style.display = "none";
}

// criar post
async function submitPost() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert("Você precisa estar logado!");

  const title = document.getElementById("postTitle").value.trim();
  const content = document.getElementById("postContent").value.trim();
  const image_url = document.getElementById("postImage").value.trim();

  if (!title) return alert("O título é obrigatório!");

  const { error } = await supabase.from("posts").insert([
    { user_id: user.id, title, content, image_url }
  ]);

  if (error) {
    console.error(error);
    alert("Erro ao criar post!");
  } else {
    document.getElementById("postTitle").value = "";
    document.getElementById("postContent").value = "";
    document.getElementById("postImage").value = "";
    loadCommunityPosts();
    unlockAchievement(user.id, "Primeira fanart"); // conquista 🎉
  }
}

// carregar posts
async function loadCommunityPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, content, image_url, created_at, user_id, profiles(username)")
    .order("created_at", { ascending: false });

  const container = document.getElementById("communityPosts");
  if (error) {
    console.error(error);
    container.innerHTML = "Erro ao carregar posts.";
    return;
  }

  if (!data || data.length === 0) {
    container.innerHTML = "<p>Nenhum post ainda.</p>";
    return;
  }

  container.innerHTML = data.map(p => `
    <div class="post" style="border:1px solid #ddd;padding:10px;margin-bottom:12px;border-radius:8px">
      <h4>${p.title}</h4>
      ${p.image_url ? `<img src="${p.image_url}" style="max-width:100%;border-radius:8px;margin:6px 0">` : ""}
      <p>${p.content ?? ""}</p>
      <small style="color:#666">por ${p.profiles?.username ?? "Anônimo"} em ${new Date(p.created_at).toLocaleString()}</small>

      <div style="margin-top:8px">
        <button class="btn-small" onclick="likePost('${p.id}')">👍 Curtir</button>
        <span id="likes-${p.id}">0</span> likes
        <button class="btn-small" onclick="toggleComments('${p.id}')">💬 Comentários</button>
      </div>

      <div id="comments-${p.id}" style="margin-top:8px;display:none"></div>
    </div>
  `).join("");

  // carregar contagem de likes
  data.forEach(p => loadLikes(p.id));
}

// dar like
async function likePost(postId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert("Você precisa estar logado!");

  const { error } = await supabase
    .from("post_likes")
    .insert([{ post_id: postId, user_id: user.id }]);

  if (error && error.code !== "23505") { // já deu like
    console.error(error);
    alert("Erro ao curtir.");
  }

  loadLikes(postId);
}

// carregar likes
async function loadLikes(postId) {
  const { count, error } = await supabase
    .from("post_likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", postId);

  if (!error) {
    document.getElementById(`likes-${postId}`).innerText = count;
  }
}

// abrir/fechar comentários
function toggleComments(postId) {
  const el = document.getElementById(`comments-${postId}`);
  el.style.display = el.style.display === "none" ? "block" : "none";
  if (el.style.display === "block") loadCommentsForPost(postId);
}

// carregar comentários de um post
async function loadCommentsForPost(postId) {
  const container = document.getElementById(`comments-${postId}`);
  const { data, error } = await supabase
    .from("post_comments")
    .select("content, created_at, profiles(username)")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    container.innerHTML = "Erro ao carregar comentários.";
    return;
  }

  container.innerHTML = `
    <div>
      <textarea id="newComment-${postId}" placeholder="Escreva um comentário..." style="width:100%;height:50px"></textarea>
      <button class="btn-small" onclick="addCommentToPost('${postId}')">Enviar</button>
    </div>
    <div style="margin-top:8px">
      ${data.map(c => `
        <div style="margin-bottom:6px">
          <strong>${c.profiles?.username ?? "Anônimo"}</strong>: ${c.content}
        </div>
      `).join("")}
    </div>
  `;
}

// adicionar comentário em um post
async function addCommentToPost(postId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert("Você precisa estar logado!");

  const textarea = document.getElementById(`newComment-${postId}`);
  const content = textarea.value.trim();
  if (!content) return;

  const { error } = await supabase
    .from("post_comments")
    .insert([{ post_id: postId, user_id: user.id, content }]);

  if (error) {
    console.error(error);
    alert("Erro ao comentar.");
  } else {
    textarea.value = "";
    loadCommentsForPost(postId);
    unlockAchievement(user.id, "Primeiro comentário em fanart");
  }
}
