import { loadUserAchievements } from "../src/services/achievements.js";
import { renderAchievements, renderPosts } from "../src/ui/render.js";
import { loadPosts } from "../src/services/posts.js";

(async () => {
  try {
    const achievements = await loadUserAchievements();
    renderAchievements(achievements);

    const posts = await loadPosts();
    renderPosts(posts);
  } catch (err) {
    console.error("Erro ao inicializar app:", err);
  }
})();
