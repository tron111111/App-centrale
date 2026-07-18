// toast.js
// Petite bulle de confirmation en bas de l'écran (succès / avertissement /
// suppression). Nécessite un conteneur dans la page :
//   <div class="toast-shared" id="toast"></div>
// et les styles associés (voir toast.css).
//
// Les appels à showToast() sont mis en file d'attente : si un toast est
// déjà affiché à l'écran, un nouvel appel ne l'écrase plus (ce qui rendait
// le premier illisible en cas d'appels rapprochés) mais attend qu'il
// disparaisse avant de s'afficher à son tour.
let _toastTimer;
let _toastEnCours = false;
const _fileAttenteToasts = [];
const TOAST_ICONS = {
  success: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="16 9 10.5 15 8 12.5"/></svg>',
  warn: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  delete: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>'
};
function showToast(type, msg) {
  _fileAttenteToasts.push({ type: type, msg: msg });
  _traiterFileToasts();
}

function _traiterFileToasts() {
  if (_toastEnCours || _fileAttenteToasts.length === 0) return;
  const t = document.getElementById('toast');
  if (!t) {
    // Pas de conteneur sur cette page : on vide la file silencieusement
    // plutôt que de rester bloqué à jamais en attente d'un affichage
    // qui n'arrivera jamais.
    _fileAttenteToasts.length = 0;
    return;
  }

  const suivant = _fileAttenteToasts.shift();
  _toastEnCours = true;

  t.innerHTML = (TOAST_ICONS[suivant.type] || '') + '<span>' + suivant.msg + '</span>';
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(function () {
    t.classList.remove('show');
    _toastEnCours = false;
    // Petit délai après la disparition avant d'afficher le suivant, pour
    // que l'animation de sortie/entrée reste visible même en cas de
    // toasts empilés.
    setTimeout(_traiterFileToasts, 200);
  }, 2400);
}
