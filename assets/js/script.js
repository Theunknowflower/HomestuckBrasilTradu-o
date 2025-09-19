// =========================
// CONFIGURAÇÃO
// =========================
const API_URL = "https://vhopcdzemdiqtvrwmqqo.supabase.co"; 
const API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZob3BjZHplbWRpcXR2cndtcXFvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMjc2MTUsImV4cCI6MjA3MzgwMzYxNX0.j8podlPF9lBz2LfzDq1Z0NYF2QA3tQRK-tOIalWz2sI"; 
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const ADMIN_EMAIL = "Homestucknerdsbrasil@gmail.com";

// =============== AUTENTICAÇÃO ===============

// Cadastro
async function signUpEmail(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    alert("Erro ao cadastrar: " + error.message);
  } else {
    alert("Conta criada! Verifique seu e-mail para confirmar.");
    updateUserUI();
  }
}

// Login
async function signInEmail(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    alert("Erro ao entrar: " + error.message);
  } else {
    alert("Login realizado!");
    updateUserUI();
  }
}

// Logout
async function signOut() {
  await supabase.auth.signOut();
  alert("Você saiu da conta.");
  updateUserUI();
}

// Atualiza avatar e nome
async function updateUserUI() {
  const { data: { user } } = await supabase.auth.getUser();
  const headerUser = document.getElementById("headerUser");
  const avatar = document.querySelector(".user-avatar");

  if (user) {
    headerUser.textContent = user.email;
    avatar.textContent = user.email[0].toUpperCase();
  } else {
    headerUser.textContent = "Convidado";
    avatar.textContent = "U";
  }
}

// Executa sempre ao abrir a página
updateUserUI();

// =============== INTERFACE ===============

// Tabs
function openTab(tabId) {
  document.querySelectorAll(".panel").forEach(panel => {
    panel.style.display = "none";
  });
  const target = document.getElementById(tabId);
  if (target) target.style.display = "block";
}
window.openTab = openTab;

// Embed leitor
function toggleEmbed() {
  const embed = document.getElementById("embedWrap");
  embed.style.display = (embed.style.display === "none" || embed.style.display === "")
    ? "block"
    : "none";
}
window.toggleEmbed = toggleEmbed;

// Navegação fake (você pode depois conectar ao banco)
function previousPage() { alert("Página anterior"); }
function nextPage() { alert("Próxima página"); }
function savePage() { alert("Página salva (mock)"); }
function submitPost() { alert("Novo post (mock)"); }

window.signUpEmail = signUpEmail;
window.signInEmail = signInEmail;
window.signOut = signOut;
window.savePage = savePage;
window.previousPage = previousPage;
window.nextPage = nextPage;
window.submitPost = submitPost;

