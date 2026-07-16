// theme-early.js
// Applique le thème (clair/sombre) AVANT le premier rendu de la page, pour
// éviter un flash de la mauvaise couleur si l'utilisateur a choisi le mode
// sombre (ou si son système est en sombre par défaut).
//
// IMPORTANT : ce script doit être chargé en tout premier dans <head>,
// sans defer/async, avant toute feuille de style. C'est un script "classique"
// (pas de <script src type=module>), donc il bloque le rendu et s'exécute
// dans l'ordre du document — exactement comme l'ancien bloc inline qu'il
// remplace sur chaque page.
//
// La bascule manuelle (bouton), la synchronisation de l'icône/libellé, etc.
// sont gérées séparément par theme.js, chargé plus tard avec le reste des
// scripts de la page (voir theme.js).
(function () {
  var saved = localStorage.getItem('theme');
  var sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches;
  var theme = saved || (sysDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
})();
