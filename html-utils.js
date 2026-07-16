// html-utils.js
// Échappement HTML commun à toutes les pages qui injectent des données
// (saisies par un agent, ou venant de Supabase) dans du innerHTML via des
// templates littéraux. À utiliser pour TOUTE donnée avant de l'insérer dans
// un fragment HTML (noms de biens, adresses, notes, etc.), pour empêcher
// toute injection HTML/JS.
//
// Remplace 4 implémentations quasi identiques qui existaient auparavant sous
// des noms différents selon la page (escHtml, escapeHTML, esc) — voir les
// alias de compatibilité laissés dans chaque page pour ne pas avoir à
// renommer tous les appels existants.
function escHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
