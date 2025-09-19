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

async function submitPost() {
  const title = document.getElementById("postTitle").value.trim();
  const content = document.getElementById("postContent").value.trim();
  const image_url = document.getElementById("postImage").value.trim();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    alert("Você precisa estar logado!");
    return;
  }

  const { error } = await supabase
    .from("posts")
    .insert([{ user_id: user.id, title, content, image_url }]);

  if (error) {
    console.error(error);
    alert("Erro ao publicar.");
  } else {
    closeModal("newPost");
    loadPosts();
    unlockAchievement(user.id, "Primeira fanart"); // conquista automática 🎉
  }
}
async function loadPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, content, image_url, created_at, user_id")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const list = document.getElementById("fanartList");
  if (!list) return;

  if (data.length === 0) {
    list.innerHTML = "<p style='color:#666'>Nenhuma fanart ainda.</p>";
    return;
  }

  list.innerHTML = data.map(p => `
    <div class="post" style="margin-bottom:12px">
      <h4>${p.title}</h4>
      ${p.image_url ? `<img src="${p.image_url}" style="max-width:100%;border-radius:8px;margin:6px 0">` : ""}
      <p>${p.content ?? ""}</p>
      <small style="color:#666">Publicado em ${new Date(p.created_at).toLocaleString()}</small>
    </div>
  `).join("");
}
async function loadPosts() {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, content, image_url, created_at, user_id")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    return;
  }

  const list = document.getElementById("fanartList");
  if (!list) return;

  if (data.length === 0) {
    list.innerHTML = "<p style='color:#666'>Nenhuma fanart ainda.</p>";
    return;
  }

  list.innerHTML = data.map(p => `
    <div class="post" style="margin-bottom:12px">
      <h4>${p.title}</h4>
      ${p.image_url ? `<img src="${p.image_url}" style="max-width:100%;border-radius:8px;margin:6px 0">` : ""}
      <p>${p.content ?? ""}</p>
      <small style="color:#666">Publicado em ${new Date(p.created_at).toLocaleString()}</small>
    </div>
  `).join("");
}
async function loadUserPosts(userId) {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, image_url, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  const container = document.getElementById("profileFanarts");
  if (!container) return;

  if (error || data.length === 0) {
    container.innerHTML = "<p style='color:#666'>Nenhuma fanart enviada.</p>";
    return;
  }

  container.innerHTML = data.map(p => `
    <div style="margin-bottom:8px">
      ${p.image_url ? `<img src="${p.image_url}" style="width:60px;height:60px;object-fit:cover;border-radius:6px">` : ""}
      <span>${p.title}</span>
    </div>
  `).join("");
}
function subscribeToPosts() {
  supabase
    .channel('posts-channel')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'posts',
      },
      (payload) => {
        console.log("Nova fanart recebida:", payload.new);

        const list = document.getElementById("fanartList");
        if (!list) return;

        const p = payload.new;
        const div = document.createElement("div");
        div.className = "post";
        div.style.marginBottom = "12px";
        div.innerHTML = `
          <h4>${p.title}</h4>
          ${p.image_url ? `<img src="${p.image_url}" style="max-width:100%;border-radius:8px;margin:6px 0">` : ""}
          <p>${p.content ?? ""}</p>
          <small style="color:#666">Publicado em ${new Date(p.created_at).toLocaleString()}</small>
        `;
        // adiciona no topo
        list.prepend(div);
      }
    )
    .subscribe();
}



function subscribeToUserPosts(userId) {
  supabase
    .channel('user-posts-' + userId)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'posts',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        const container = document.getElementById("profileFanarts");
        if (!container) return;

        const p = payload.new;
        const div = document.createElement("div");
        div.style.marginBottom = "8px";
        div.innerHTML = `
          ${p.image_url ? `<img src="${p.image_url}" style="width:60px;height:60px;object-fit:cover;border-radius:6px">` : ""}
          <span>${p.title}</span>
        `;
        container.prepend(div);
      }
    )
    .subscribe();
}
loadUserPosts(user.id);
subscribeToUserPosts(user.id);





// função para formatar data em "há X tempo"
function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = (now - date) / 1000; // segundos

  if (diff < 60) return "agora mesmo";
  if (diff < 3600) return `${Math.floor(diff / 60)} min atrás`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} h atrás`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)} dias atrás`;
  return date.toLocaleDateString("pt-BR");
}

// renderizar comentários
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

  container.innerHTML = `

(async () => {
  const { data, error } = await supabase.from("comments").select("count").limit(1);
  if (error) {
    console.error("Erro Supabase:", error);
  } else {
    console.log("Supabase conectado ✅", data);
  }
})();


// inicializações principais
loadComments();
subscribeToComments();

loadPosts();
subscribeToPosts();

