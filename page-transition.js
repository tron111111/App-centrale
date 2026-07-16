// page-transition.js
// Overlay plein écran (logo qui pulse) affiché brièvement lors d'un clic sur
// un lien de navigation vers une autre page/app du portail, pour éviter un
// flash d'écran blanc pendant le chargement de la page suivante.
//
// Markup attendu quelque part dans la page (voir page-transition.css) :
//   <div id="laforet-transition"><img src="logo_laforet.png" alt="Laforêt"></div>
//
// Tout lien portant l'attribut data-transition déclenche l'overlay avant de
// naviguer, ce qui permet de le réutiliser sur n'importe quelle page sans
// dépendre d'un nom de classe particulier (ex. .app-card).
document.addEventListener('DOMContentLoaded', function () {
  const overlay = document.getElementById('laforet-transition');
  if (!overlay) return;

  document.querySelectorAll('[data-transition]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      overlay.classList.add('show');
      setTimeout(function () { window.location.href = link.href; }, 280);
    });
  });

  // Correctif bouton retour : si la page est restaurée depuis le cache
  // mémoire du navigateur (bfcache) avec l'overlay resté affiché juste avant
  // de la quitter, on le masque systématiquement à chaque affichage.
  window.addEventListener('pageshow', function () {
    overlay.classList.remove('show');
  });
});
