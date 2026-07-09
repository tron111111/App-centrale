// auth-guard.js
// À inclure dans CHAQUE page qui doit être protégée (dossier.html, blog.html,
// bibliotheque.html, photoimmo.html, index.html), juste après supabase-client.js.
//
// Ce script vérifie qu'un utilisateur est connecté. Si ce n'est pas le cas,
// il redirige immédiatement vers login.html.
//
// Utilisation dans le HTML :
//   <script src="supabase-lib.js"></script>
//   <script src="supabase-client.js"></script>
//   <script src="auth-guard.js"></script>
//   <!-- le reste de vos scripts, qui peuvent supposer que l'utilisateur est connecté -->

(async function () {
  const utilisateur = await getUtilisateurConnecte();
  if (!utilisateur) {
    window.location.href = 'login.html';
  }
})();
