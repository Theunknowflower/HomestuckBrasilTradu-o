const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");

async function login() {
  const { data, error } = await supabaseClient.auth.signInWithOAuth({
    provider: "discord"
  });
  if (error) console.error(error);
}

async function logout() {
  await supabaseClient.auth.signOut();
  location.reload();
}

loginBtn.addEventListener("click", login);
logoutBtn.addEventListener("click", logout);

supabaseClient.auth.onAuthStateChange(async (event, session) => {
  if (session?.user) {
    loginBtn.style.display = "none";
    logoutBtn.style.display = "block";
    console.log("Logado:", session.user);
  } else {
    loginBtn.style.display = "block";
    logoutBtn.style.display = "none";
  }
});
