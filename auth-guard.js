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
    return;
  }
  demarrerSurveillanceInactivite();
})();

// --- Déconnexion automatique après 1h d'inactivité ---
//
// Ce comportement ne s'applique qu'aux pages qui chargent auth-guard.js,
// donc jamais à login.html ni à test-connexion.html (elles ne l'incluent pas).
//
// La dernière activité est horodatée dans localStorage (clé partagée entre
// tous les onglets/pages du portail) : naviguer d'une page à l'autre ne
// réinitialise donc pas indûment le compte à rebours, et plusieurs onglets
// ouverts en même temps restent synchronisés sur la même minuterie.

function demarrerSurveillanceInactivite() {
  const DUREE_INACTIVITE_MS = 60 * 60 * 1000; // 1 heure
  const CLE_DERNIERE_ACTIVITE = 'laforet_derniere_activite';
  const INTERVALLE_VERIFICATION_MS = 15 * 1000; // vérifie toutes les 15s

  function enregistrerActivite() {
    try {
      localStorage.setItem(CLE_DERNIERE_ACTIVITE, Date.now().toString());
    } catch (e) {
      // localStorage indisponible (navigation privée stricte, etc.) : on ignore,
      // la session restera simplement active jusqu'à fermeture de l'onglet.
    }
  }

  async function verifierInactivite() {
    let derniere;
    try {
      derniere = parseInt(localStorage.getItem(CLE_DERNIERE_ACTIVITE), 10);
    } catch (e) {
      return;
    }
    if (!derniere || isNaN(derniere)) {
      enregistrerActivite();
      return;
    }
    if (Date.now() - derniere >= DUREE_INACTIVITE_MS) {
      await deconnexion();
    }
  }

  // Événements considérés comme de l'activité utilisateur.
  const evenementsActivite = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];

  // On limite la fréquence d'écriture dans localStorage (au plus une fois par seconde).
  let dernierEnregistrement = 0;
  function surActivite() {
    const maintenant = Date.now();
    if (maintenant - dernierEnregistrement > 1000) {
      dernierEnregistrement = maintenant;
      enregistrerActivite();
    }
  }

  enregistrerActivite();
  evenementsActivite.forEach(function (nom) {
    window.addEventListener(nom, surActivite, { passive: true });
  });

  // Revérifie aussi quand l'onglet redevient visible (ex. après mise en veille).
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') {
      verifierInactivite();
    }
  });

  // Réaction immédiate si un AUTRE onglet enregistre une déconnexion (par
  // exemple : déconnexion manuelle, ou inactivité détectée en premier dans
  // cet autre onglet). Sans ça, cet onglet-ci resterait connecté jusqu'à
  // son prochain cycle de polling (jusqu'à 15s de décalage) après que
  // l'autre onglet ait déjà coupé la session côté Supabase.
  window.addEventListener('storage', function (evenement) {
    if (evenement.key === CLE_DERNIERE_ACTIVITE) {
      verifierInactivite();
    }
  });

  setInterval(verifierInactivite, INTERVALLE_VERIFICATION_MS);
}
