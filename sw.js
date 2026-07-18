// sw.js
// Service Worker de mise en cache "hors ligne" pour le portail App-centrale.
// Rôle : permettre l'ouverture des pages (interface) même sans connexion
// réseau. Ne concerne PAS les données Supabase (biens, photos, connexion),
// qui nécessitent toujours une connexion pour être lues/écrites en direct.
//
// Installation dans chaque page HTML du portail (juste avant </body>) :
//   <script>
//     if ('serviceWorker' in navigator) {
//       navigator.serviceWorker.register('sw.js');
//     }
//   </script>

// Incrémenter ce nom à chaque modification de la liste de fichiers ou du
// contenu des fichiers eux-mêmes, pour forcer la mise à jour du cache chez
// les utilisateurs (sinon ils resteraient sur l'ancienne version en cache).
const NOM_CACHE = 'app-centrale-v3';

// Liste des fichiers statiques à mettre en cache pour un fonctionnement
// hors ligne de l'interface. À compléter si de nouveaux fichiers/pages
// sont ajoutés au portail.
const FICHIERS_A_METTRE_EN_CACHE = [
  'index.html',
  'login.html',
  'accepter-invitation.html',
  'reinitialiser-mdp.html',
  'bibliotheque.html',
  'documentation_bibliotheque.html',
  'photoimmo.html',
  'dossier.html',
  'blog.html',
  'supabase-lib.js',
  'supabase-client.js',
  'auth-guard.js',
  'theme-early.js',
  'theme.js',
  'html-utils.js',
  'toast.js',
  'toast.css',
  'page-transition.js',
  'page-transition.css',
  'logo_laforet.png'
];

// --- Installation : téléchargement et mise en cache des fichiers listés ---
//
// IMPORTANT : on n'utilise PAS cache.addAll(), car un seul fichier de la
// liste renvoyant autre chose que 200 (renommage, faute de frappe, fichier
// pas encore déployé...) ferait échouer l'installation entière du Service
// Worker, silencieusement, sans que personne ne s'en aperçoive. On charge
// donc chaque fichier séparément et on logue ceux qui échouent, sans
// bloquer les autres.
self.addEventListener('install', function (evenement) {
  evenement.waitUntil(
    caches.open(NOM_CACHE).then(function (cache) {
      return Promise.allSettled(
        FICHIERS_A_METTRE_EN_CACHE.map(function (fichier) {
          return cache.add(fichier).catch(function (erreur) {
            console.warn('[sw.js] Échec de mise en cache : ' + fichier, erreur);
          });
        })
      );
    })
  );
  // Active immédiatement ce Service Worker sans attendre la fermeture des
  // onglets ouverts sur l'ancienne version.
  self.skipWaiting();
});

// --- Activation : suppression des anciens caches (versions précédentes) ---
self.addEventListener('activate', function (evenement) {
  evenement.waitUntil(
    caches.keys().then(function (nomsCache) {
      return Promise.all(
        nomsCache
          .filter(function (nom) { return nom !== NOM_CACHE; })
          .map(function (nom) { return caches.delete(nom); })
      );
    })
  );
  self.clients.claim();
});

// --- Interception des requêtes ---
// Stratégie "network first, cache fallback" pour les fichiers de l'app :
// on essaie toujours le réseau en premier (pour avoir la version à jour),
// et on retombe sur le cache uniquement si le réseau échoue (hors ligne).
// Les requêtes vers Supabase (tclqiusyonocedobtoky.supabase.co) ne sont
// jamais interceptées : elles doivent échouer normalement si hors ligne,
// pour que le code de la page puisse gérer cette erreur proprement.
self.addEventListener('fetch', function (evenement) {
  const url = new URL(evenement.request.url);

  // On ne gère que les requêtes GET vers notre propre origine.
  if (evenement.request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  evenement.respondWith(
    fetch(evenement.request)
      .then(function (reponseReseau) {
        // Réseau disponible : on met à jour le cache avec la version fraîche
        // pour la prochaine fois, et on renvoie cette version au navigateur.
        const copie = reponseReseau.clone();
        caches.open(NOM_CACHE).then(function (cache) {
          cache.put(evenement.request, copie);
        });
        return reponseReseau;
      })
      .catch(function () {
        // Réseau indisponible : on sert la version en cache si elle existe.
        return caches.match(evenement.request);
      })
  );
});