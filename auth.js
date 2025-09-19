// js/auth.js
async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({ provider: "google" });
  if (error) alert("Erro no login: " + error.message);
}

async function signOut() {
  await supabase.auth.signOut();
  location.reload();
}

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  return data?.user || null;
}
