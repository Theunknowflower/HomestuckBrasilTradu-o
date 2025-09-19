// =========================
// CONFIGURAÇÃO
// =========================
const API_URL = "https://vhopcdzemdiqtvrwmqqo.supabase.co"; 
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZob3BjZHplbWRpcXR2cndtcXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjc2MTUsImV4cCI6MjA3MzgwMzYxNX0.j8podlPF9lBz2LfzDq1Z0NYF2QA3tQRK-tOIalWz2sI"; 

const ADMIN_EMAIL = "Homestucknerdsbrasil@gmail.com";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =============== AUTENTICAÇÃO ===============

async function signUpEmail(email, password) {
  const { error } = await supabase.auth.signUp({ email, password });
  if (error) return alert("Erro ao cadastrar: " + error.message);
  alert("Conta criada! Verifique seu e-mail.");
  updateUserUI();
}

async function signInEmail(email, password) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return alert("Erro ao entrar: " + error.message);
  alert("Login realizado!");
  updateUserUI();
  loadComments();
}

async function signOut() {
  await supabase.auth.signOut();
  alert("Você saiu da conta.");
  updateUserUI();
}

// Atualiza avatar/nome
async function updateUserUI() {
  const { data: { user } } = await supabase.auth.getUser();
  const headerUser = document.getElementById("headerUser");
  const avatar = document.querySelector(".user-avatar");

  if (user) {
    headerUser.textContent = user.email;
    avatar.textContent = user.email[0].toUpperCase();
    document.getElementById("commentSection").innerHTML = `
      <textarea id="newComment" placeholder="Escreva um comentário..." style="width:100%;height:60px"></textarea>
      <button class="btn-small" onclick="submitComment()">Comentar</button>
      <div id="commentList"></div>
    `;
    loadComments();
  } else {
    headerUser.textContent = "Convidado";
    avatar.textContent = "U";
    document.getElementById("commentSection").innerHTML = `
      <div style="color:#888">Você precisa estar logado para comentar.</div>
    `;
  }
}

// =============== LEITURA (progressão de páginas) ===============

let currentPage = 1;

async function savePage() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert("Faça login para salvar página.");

  const { error } = await supabase.from("pages").insert([
    { user_id: user.id, page_number: currentPage }
  ]);
  if (error) return alert("Erro ao salvar: " + error.message);

  alert("Página salva!");
}

function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    updatePageUI();
  }
}

function nextPage() {
  currentPage++;
  updatePageUI();
}

function updatePageUI() {
  document.getElementById("pageMeta").textContent = `Capítulo 1 • Página ${currentPage}`;
  document.getElementById("readerImg").src = `pages/${currentPage}.png`; // ajuste conforme suas imagens
}

// =============== COMENTÁRIOS ===============

async function submitComment() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return alert("Você precisa estar logado.");

  const content = document.getElementById("newComment").value;
  if (!content) return alert("Comentário vazio.");

  const { error } = await supabase.from("comments").insert([
    { user_id: user.id, page_number: currentPage, content }
  ]);
  if (error) return alert("Erro: " + error.message);

  document.getElementById("newComment").value = "";
  loadComments();
}

async function loadComments() {
  const { data, error } = await supabase
    .from("comments")
    .select("content, created_at, user_id")
    .eq("page_number", currentPage)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const list = document.getElementById("commentList");
  if (!list) return;

  list.innerHTML = data.map(c => `
    <div style="padding:6px;border-bottom:1px solid #333">
      <strong>${c.user_id.substring(0,6)}</strong> — ${new Date(c.created_at).toLocaleString()}<br>
      ${c.content}
    </div>
  `).join("");
}

// =============== INTERFACE EXTRA ===============

function toggleEmbed() {
  const embed = document.getElementById("embedWrap");
  embed.style.display = (embed.style.display === "none" || embed.style.display === "")
    ? "block"
    : "none";
}

// Expor funções globais pro HTML
window.signUpEmail = signUpEmail;
window.signInEmail = signInEmail;
window.signOut = signOut;
window.savePage = savePage;
window.previousPage = previousPage;
window.nextPage = nextPage;
window.toggleEmbed = toggleEmbed;
window.submitComment = submitComment;

// Rodar ao carregar
updateUserUI();

