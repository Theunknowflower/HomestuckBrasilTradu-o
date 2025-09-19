// =======================
// CONFIG SUPABASE
// =======================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://vhopcdzemdiqtvrwmqqo.supabase.co";
const SUPABASE_KEY = "SUA_CHAVE_PUBLIC_ANON";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// =======================
// LOGIN / LOGOUT
// =======================
async function updateUserUI() {
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  const userInfo = document.getElementById("user-info");
  const authBtn = document.getElementById("auth-btn");
  const logoutBtn = document.getElementById("logout-btn");

  if (user) {
    userInfo.textContent = user.email;
    authBtn.style.display = "none";
    logoutBtn.style.display = "inline-block";
  } else {
    userInfo.textContent = "Usuário";
    authBtn.style.display = "inline-block";
    logoutBtn.style.display = "none";
  }
}

async function signIn() {
  const email = prompt("Digite seu e-mail:");
  const password = prompt("Digite sua senha:");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) alert(error.message);
  await updateUserUI();
}

async function signUp() {
  const email = prompt("Digite seu e-mail:");
  const password = prompt("Crie sua senha:");

  const { error } = await supabase.auth.signUp({ email, password });
  if (error) alert(error.message);
  else alert("Conta criada! Verifique seu e-mail.");
  await updateUserUI();
}

async function signOut() {
  await supabase.auth.signOut();
  await updateUserUI();
}

// =======================
// LEITURA DAS PÁGINAS
// =======================
let currentPage = 1;

async function loadPage(num) {
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("id", num)
    .single();

  if (error || !data) {
    document.getElementById("page-content").innerHTML = "<p>Fim!</p>";
    return;
  }

  document.getElementById("page-content").innerHTML = `
    <img src="${data.image_url}" alt="Página">
    <p>${data.text || ""}</p>
  `;

  currentPage = data.id;

  // 🔑 Desbloqueia conquista na primeira página
  if (currentPage === 1) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) unlockAchievement(user.id, "Primeira página");
  }
}

async function nextPage() {
  await loadPage(currentPage + 1);
}
async function prevPage() {
  if (currentPage > 1) await loadPage(currentPage - 1);
}

// =======================
// CONQUISTAS
// =======================
async function unlockAchievement(userId, achievementName) {
  const { data: achievement } = await supabase
    .from("achievements")
    .select("id")
    .eq("name", achievementName)
    .single();

  if (!achievement) return;

  await supabase.from("user_achievements").insert({
    user_id: userId,
    achievement_id: achievement.id,
  });

  alert("🎉 Conquista desbloqueada: " + achievementName);
}

// =======================
// EVENTOS
// =======================
document.getElementById("auth-btn").addEventListener("click", () => {
  const option = confirm("Já tem conta? OK = Entrar | Cancelar = Criar");
  if (option) signIn();
  else signUp();
});

document.getElementById("logout-btn").addEventListener("click", signOut);

// Carrega a primeira página ao abrir
loadPage(1);
updateUserUI();

// importa cliente do Supabase
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// inicializa
const SUPABASE_URL = "https://vhopcdzemdiqtvrwmqqo.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZob3BjZHplbWRpcXR2cndtcXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjc2MTUsImV4cCI6MjA3MzgwMzYxNX0.j8podlPF9lBz2LfzDq1Z0NYF2QA3tQRK-tOIalWz2sI"; // copia da dashboard

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);



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
