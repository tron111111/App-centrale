// supabase-client.js
// Module commun de connexion Supabase pour toutes les apps du portail Laforêt Pithiviers.
// Ce fichier ne fait qu'initialiser la connexion : il n'est pas encore utilisé
// pour remplacer localStorage. On teste juste que ça communique.

// La librairie Supabase est hébergée localement dans ce repo (fichier supabase-lib.js),
// pas de CDN externe, pour rester cohérent avec la politique "zéro dépendance externe"
// et la Content-Security-Policy stricte du portail.
// À inclure AVANT ce script dans le HTML :
// <script src="supabase-lib.js"></script>

const SUPABASE_URL = 'https://tclqiusyonocedobtoky.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjbHFpdXN5b25vY2Vkb2J0b2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NzgzNjksImV4cCI6MjA5OTE1NDM2OX0.XVi1FBXk-RjdFslOuikXYWvc1CSrWmTareDDTgzQxxM';

// Crée un client unique, réutilisable dans toutes les pages qui incluent ce fichier.
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- Fonctions communes d'authentification, utilisées par auth-guard.js et login.html ---

// Renvoie l'utilisateur connecté, ou null si personne n'est connecté.
async function getUtilisateurConnecte() {
  const { data, error } = await supabaseClient.auth.getSession();
  if (error || !data.session) return null;
  return data.session.user;
}

// Déconnecte l'utilisateur et le renvoie vers la page de connexion.
async function deconnexion() {
  await supabaseClient.auth.signOut();
  window.location.href = 'login.html';
}

// Crée un compte. Selon la configuration Supabase (confirmation email activée
// ou non), l'utilisateur est soit connecté immédiatement, soit doit d'abord
// cliquer sur le lien de confirmation reçu par email.
// Renvoie { data, error }.
async function inscription(email, motdepasse) {
  return await supabaseClient.auth.signUp({
    email: email,
    password: motdepasse
  });
}

// Envoie un email de réinitialisation de mot de passe. Le lien contenu dans
// cet email ramène l'utilisateur sur redirectionVersPage (par défaut
// reinitialiser-mdp.html), avec un token de session temporaire dans l'URL.
// Renvoie { data, error }.
async function demanderReinitialisationMdp(email, redirectionVersPage) {
  const url = new URL(redirectionVersPage || 'reinitialiser-mdp.html', window.location.href);
  return await supabaseClient.auth.resetPasswordForEmail(email, {
    redirectTo: url.href
  });
}

// À appeler depuis reinitialiser-mdp.html une fois que l'utilisateur a saisi
// son nouveau mot de passe (la session temporaire issue du lien email doit
// déjà être active). Renvoie { data, error }.
async function mettreAJourMotDePasse(nouveauMotDePasse) {
  return await supabaseClient.auth.updateUser({
    password: nouveauMotDePasse
  });
}
