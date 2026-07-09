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
