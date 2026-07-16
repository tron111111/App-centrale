// theme.js
// Bascule manuelle du thème clair/sombre, commune à toutes les pages du
// portail. theme-early.js a déjà appliqué le bon thème avant le premier
// rendu (voir ce fichier) ; ce script se contente de :
//  - synchroniser l'icône/le libellé du bouton une fois le DOM prêt
//    (initTheme(), à appeler au chargement de la page) ;
//  - gérer le clic sur le bouton (toggleTheme(), utilisé directement en
//    onclick="toggleTheme()" dans le HTML existant).
//
// Convention attendue dans le HTML de la page :
//   <button class="theme-toggle" onclick="toggleTheme()">
//     <svg id="theme-icon" ...></svg>
//     <span id="theme-label">Mode sombre</span>
//   </button>

const THEME_ICON_MOON = '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>';
const THEME_ICON_SUN = '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>';

// Applique le thème (déjà défini sur <html data-theme="...">) à l'icône et
// au libellé du bouton de bascule, quand ils existent sur la page.
function updateThemeUI(theme) {
  const icon = document.getElementById('theme-icon');
  const label = document.getElementById('theme-label');
  if (!icon || !label) return;
  if (theme === 'dark') {
    icon.innerHTML = THEME_ICON_MOON;
    label.textContent = 'Mode clair';
  } else {
    icon.innerHTML = THEME_ICON_SUN;
    label.textContent = 'Mode sombre';
  }
}

// À appeler au chargement de la page (après le DOM prêt) pour synchroniser
// l'icône/le libellé avec le thème déjà posé par theme-early.js.
function initTheme() {
  const saved = localStorage.getItem('theme');
  const sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme:dark)').matches;
  const theme = saved || (sysDark ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', theme);
  updateThemeUI(theme);
}

// Bascule le thème et le mémorise. Exposée globalement pour les boutons
// utilisant onclick="toggleTheme()" dans le HTML.
function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem('theme', next); } catch (e) {}
  updateThemeUI(next);
}
