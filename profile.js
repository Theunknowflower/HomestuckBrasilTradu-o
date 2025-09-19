// profile.js

async function loadProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  const container = document.getElementById("profile");

  if (!user) {
    container.innerHTML = "<strong>Não logado</strong>";
    return;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("username, bio, avatar_url")
    .eq("id", user.id)
    .single();

  if (error || !data) {
    container.innerHTML = `<strong>${user.email}</strong><br><small>Perfil não configurado</small>`;
    return;
  }

  container.innerHTML = `
    <img src="${data.avatar_url ?? 'https://i.ibb.co/YPXkTZK/default-avatar.png'}" style="width:50px;border-radius:50%">
    <br><strong>${data.username ?? user.email}</strong>
    <br><small>${data.bio ?? "Sem bio"}</small>
  `;
}
