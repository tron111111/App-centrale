// supabase-client.js
// Module commun de connexion Supabase pour toutes les apps du portail Laforêt Pithiviers.
// Supabase est désormais la source de vérité pour l'ensemble du portail : biens
// (registre central, PhotoImmo, Bibliothèque), brouillons de blog, photos
// (Storage) et authentification. Ce fichier centralise l'initialisation du
// client et les fonctions d'authentification communes, réutilisées par
// auth-guard.js, login.html, accepter-invitation.html et reinitialiser-mdp.html.

// La librairie Supabase est hébergée localement dans ce repo (fichier supabase-lib.js),
// pas de CDN externe, pour rester cohérent avec la politique "zéro dépendance externe"
// et la Content-Security-Policy stricte du portail.
// À inclure AVANT ce script dans le HTML :
// <script src="supabase-lib.js"></script>

const SUPABASE_URL = 'https://tclqiusyonocedobtoky.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjbHFpdXN5b25vY2Vkb2J0b2t5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1NzgzNjksImV4cCI6MjA5OTE1NDM2OX0.XVi1FBXk-RjdFslOuikXYWvc1CSrWmTareDDTgzQxxM';

// Crée un client unique, réutilisable dans toutes les pages qui incluent ce fichier.
//
// Garde-fou : si supabase-lib.js n'a pas pu se charger (script manquant, mauvais
// ordre d'inclusion dans le HTML, CSP qui bloquerait le fichier...), window.supabase
// serait undefined et createClient() planterait la page entière avec une erreur
// peu compréhensible pour l'agent (page qui semble figée, sans explication).
// On détecte donc ce cas explicitement, avec un message clair en console ET
// une bannière visible dans la page, plutôt qu'un plantage muet. Dans le cas
// normal (supabase-lib.js chargé correctement), le comportement est strictement
// identique à avant : `supabaseClient` est créé exactement de la même façon.
let supabaseClient;
if (window.supabase && typeof window.supabase.createClient === 'function') {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.error('[supabase-client.js] La librairie Supabase (supabase-lib.js) ne s\'est pas chargée. Vérifiez que <script src="supabase-lib.js"> est bien présent AVANT <script src="supabase-client.js"> dans le HTML de cette page.');
  const afficherBanniereErreur = function () {
    const banniere = document.createElement('div');
    banniere.textContent = "Erreur technique : impossible de charger le module de connexion. Rechargez la page ou contactez un responsable si le problème persiste.";
    banniere.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:999999;background:#c0392b;color:#fff;font:600 13px -apple-system,sans-serif;padding:10px 16px;text-align:center;';
    document.body.prepend(banniere);
  };
  if (document.body) {
    afficherBanniereErreur();
  } else {
    document.addEventListener('DOMContentLoaded', afficherBanniereErreur);
  }
}

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

// Note : la création de compte se fait désormais uniquement par invitation
// (voir accepter-invitation.html), il n'y a donc plus de fonction d'auto-
// inscription ici — elle a été retirée car elle n'était plus utilisée nulle
// part dans le portail.

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
