// Detecta login via OTP ou qualquer método
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === "SIGNED_IN") {
    console.log("Usuário logado via OTP ou senha:", session.user);
    loadUserProfile(session.user); // chama sua função de perfil
  }
});
