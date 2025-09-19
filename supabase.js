async function savePage() {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) {
    alert("Você precisa estar logado para salvar o progresso!");
    return;
  }

  const pageMeta = document.getElementById("pageMeta").innerText;
  const match = pageMeta.match(/Página (\d+)/);
  const pageNumber = match ? parseInt(match[1]) : 1;

  const { error } = await supabase
    .from("progress")
    .upsert({
      user_id: user.id,
      page: pageNumber,
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error(error);
    alert("Erro ao salvar progresso!");
  } else {
    alert("Progresso salvo!");
  }
}
async function loadProgress() {
  const user = (await supabase.auth.getUser()).data.user;
  if (!user) return;

  const { data, error } = await supabase
    .from("progress")
    .select("page")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(1);

  if (data && data.length > 0) {
    openPage(data[0].page);
  }
}
function subscribeToProgress() {
  const userPromise = supabase.auth.getUser();

  userPromise.then(({ data: { user } }) => {
    if (!user) return;

    supabase
      .channel('progress-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'progress', filter: `user_id=eq.${user.id}` },
        (payload) => {
          console.log("Progresso atualizado:", payload.new);
          openPage(payload.new.page);
        }
      )
      .subscribe();
  });
}
async function loadProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error(error);
    return;
  }

  document.getElementById("headerUser").innerText = data.username ?? "Sem nome";
  if (data.avatar_url) {
    document.querySelector(".user-avatar").innerHTML = `<img src="${data.avatar_url}" alt="avatar" style="width:100%;border-radius:50%">`;
  }
}
async function updateUsername(newName) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("profiles")
    .update({ username: newName })
    .eq("id", user.id);

  if (error) console.error(error);
  else alert("Nome atualizado!");
}
async function uploadAvatar(file) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const filePath = `${user.id}/${file.name}`;

  let { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true });

  if (uploadError) {
    console.error(uploadError);
    return;
  }

  const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);

  // salva URL no perfil
  await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", user.id);

  alert("Avatar atualizado!");
}

function openProfile() {
  document.getElementById("profileModal").style.display = "flex";
  loadProfileForm();
}

function closeProfile() {
  document.getElementById("profileModal").style.display = "none";
}

// carregar dados atuais no form
async function loadProfileForm() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from("profiles")
    .select("username, avatar_url")
    .eq("id", user.id)
    .single();

  if (error) return console.error(error);

  document.getElementById("profileUsername").value = data.username ?? "";
  if (data.avatar_url) {
    document.getElementById("avatarPreview").innerHTML =
      `<img src="${data.avatar_url}" alt="avatar" style="width:80px;border-radius:50%">`;
  }
}

// salvar mudanças
async function saveProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const username = document.getElementById("profileUsername").value.trim();
  const file = document.getElementById("profileAvatar").files[0];

  let avatarUrl = null;

  if (file) {
    const filePath = `${user.id}/${file.name}`;
    let { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      alert("Erro ao enviar avatar!");
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
    avatarUrl = data.publicUrl;
  }

  const updates = {};
  if (username) updates.username = username;
  if (avatarUrl) updates.avatar_url = avatarUrl;

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", user.id);

  if (error) {
    alert("Erro ao salvar perfil!");
    console.error(error);
  } else {
    alert("Perfil atualizado!");
    closeProfile();
    loadProfile(); // atualiza header
  }
}

async function unlockAchievement(userId, achievementName) {
  // pega a conquista pelo nome
  const { data: achievement } = await supabase
    .from("achievements")
    .select("id")
    .eq("name", achievementName)
    .single();

  if (!achievement) {
    console.warn("Conquista não encontrada:", achievementName);
    return;
  }

  // insere no user_achievements (se já tiver, ignora)
  const { error } = await supabase
    .from("user_achievements")
    .insert([{ user_id: userId, achievement_id: achievement.id }])
    .select()
    .single();

  if (error && error.code !== "23505") { // 23505 = unique violation
    console.error("Erro ao desbloquear conquista:", error);
  } else {
    console.log("Conquista desbloqueada:", achievementName);
    loadUserAchievements(); // recarregar no layout
  }
}
if (!error) {
  textarea.value = "";
  loadComments();
  if (user) unlockAchievement(user.id, "Primeiro comentário");
}
async function loadUserAchievements() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    document.getElementById("savedPopups").innerHTML = "Nenhuma — faça login!";
    return;
  }

  const { data, error } = await supabase
    .from("user_achievements")
    .select("unlocked_at, achievements(name, icon_url)")
    .eq("user_id", user.id);

  if (error) {
    console.error(error);
    return;
  }

  if (data.length === 0) {
    document.getElementById("savedPopups").innerHTML = "Nenhuma ainda 😢";
    return;
  }

  document.getElementById("savedPopups").innerHTML = data.map(ua => `
    <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
      ${ua.achievements.icon_url ? `<img src="${ua.achievements.icon_url}" style="width:20px;height:20px">` : "🏆"}
      <span>${ua.achievements.name}</span>
    </div>
  `).join("");
}


