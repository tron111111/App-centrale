<p align="center">
  <img src="logo_laforet.png" width="120" alt="Logo Laforêt">
</p>

<h1 align="center">App-centrale — Laforêt Pithiviers</h1>

<p align="center">
  Portail d'applications internes pour l'agence Laforêt Pithiviers.
</p>

<p align="center">
  🔗 <a href="https://tron111111.github.io/App-centrale/">tron111111.github.io/App-centrale</a>
</p>

---

## Présentation

Ce dépôt héberge un ensemble d'outils web internes utilisés au quotidien par l'agence Laforêt Pithiviers. Les applications sont des pages HTML déployées via **GitHub Pages**, connectées à un **backend partagé Supabase** (base de données + authentification + stockage de fichiers) pour que les données (biens, photos, brouillons, prompts) soient accessibles par tous les agents, depuis n'importe quel appareil.

## Applications

| Page | Description |
|---|---|
| [`index.html`](index.html) | Portail d'accueil — sélection de l'application à ouvrir, avec barre de recherche. |
| [`bibliotheque.html`](bibliotheque.html) | Bibliothèque de prompts IA (Claude & Gemini) : annonces, emails, réseaux sociaux, prospection et administratif. Comprend un générateur d'annonce centralisé et un mode sombre. |
| [`photoimmo.html`](photoimmo.html) | PhotoImmo Pro — notation et gestion des photos de biens immobiliers pièce par pièce, avec guide de prise de vue et moteur de scoring multi-critères (netteté, exposition, contraste, balance des blancs, cadrage). |
| [`dossier.html`](dossier.html) | Dossier des biens — fiche centralisée par bien : informations générales, statut, prix, notes, et liens automatiques vers les photos (PhotoImmo Pro) et la fiche descriptive (Bibliothèque de prompts). |
| [`blog.html`](blog.html) | Générateur de blog — création d'articles pour le blog de l'agence à partir de modèles thématiques, génération directe via Claude ou Gemini (BYOK), mise en forme automatique et gestion de brouillons. |
| [`documentation_bibliotheque.html`](documentation_bibliotheque.html) | Documentation d'utilisation de la bibliothèque de prompts. |
| [`login.html`](login.html) | Page de connexion commune à tout le portail (compte agence Supabase), avec accès à la réinitialisation de mot de passe. |
| [`accepter-invitation.html`](accepter-invitation.html) | Page d'activation de compte via lien d'invitation envoyé par email (définition du mot de passe initial). Aucune auto-inscription possible depuis le portail. |
| [`reinitialiser-mdp.html`](reinitialiser-mdp.html) | Page de définition d'un nouveau mot de passe suite à une demande « mot de passe oublié » depuis `login.html`. |
| [`test-connexion.html`](test-connexion.html) | Page technique de diagnostic — vérifie que le navigateur arrive à joindre Supabase. Pas destinée aux agents. |

## Authentification

Tout le portail est protégé par un compte agence (email + mot de passe), géré via **Supabase Auth** :

- Chaque page protégée charge `supabase-lib.js` → `supabase-client.js` → `auth-guard.js`, dans cet ordre. `auth-guard.js` redirige automatiquement vers `login.html` si personne n'est connecté.
- **Création de compte uniquement par invitation** : il n'y a pas d'auto-inscription depuis le portail. Un responsable crée le compte depuis le dashboard Supabase (Authentication > Users > Invite), l'agent reçoit un email avec un lien vers `accepter-invitation.html`, où il choisit son mot de passe pour activer son compte.
- **Mot de passe oublié** : depuis `login.html`, un agent peut demander un email de réinitialisation, qui pointe vers `reinitialiser-mdp.html` pour définir un nouveau mot de passe.
- **Déconnexion automatique après 1h d'inactivité** : `auth-guard.js` surveille l'activité (clic, mouvement de souris, clavier, scroll, touch) et déconnecte automatiquement l'utilisateur au bout d'1 heure sans aucune interaction, avec redirection vers `login.html`. La dernière activité est horodatée dans `localStorage` et partagée entre tous les onglets/pages du portail, donc naviguer d'une app à l'autre ne réinitialise pas indûment le compte à rebours. Un onglet réagit aussi immédiatement (`storage` event) dès qu'un autre onglet écrit dans cet horodatage, plutôt que d'attendre son propre cycle de vérification (jusqu'à 15s de décalage auparavant). Ce mécanisme ne s'applique qu'aux pages qui chargent `auth-guard.js` — il ne concerne donc ni `login.html`, ni `accepter-invitation.html`, ni `reinitialiser-mdp.html`, ni `test-connexion.html`.
- La clé utilisée côté navigateur est la clé **`anon` publique** de Supabase : ce n'est pas un secret (elle est conçue pour être visible côté client), c'est la sécurité **Row Level Security** côté base de données qui protège réellement les données — seuls les comptes authentifiés peuvent lire/écrire.

## Backend partagé (Supabase)

Projet Supabase dédié, hébergé en région UE, avec DPA signé (voir section RGPD plus bas). Deux briques sont utilisées :

**Base de données (Postgres)** — une table par collection de données, chaque ligne portant un `id` et une colonne `data` en JSONB :

| Table | Alimentée par | Contenu |
|---|---|---|
| `biens_registry` | `dossier.html`, `photoimmo.html`, `bibliotheque.html` | Registre reliant un même bien entre les 3 apps, une ligne par bien |
| `biens_bibliotheque` | `bibliotheque.html` | Fiches descriptives des biens (annonces) |
| `biens_photoimmo` | `photoimmo.html` | Métadonnées des photos par bien (scoring, pièces, dates), une ligne par bien |
| `blog_drafts` | `blog.html` | Brouillons d'articles de blog, une ligne par brouillon |

Toutes les tables sont protégées par des policies **Row Level Security** limitant l'accès aux seuls comptes authentifiés du portail.

**Storage (fichiers)** — bucket privé **`photoimmo-photos`** : les vignettes photo de PhotoImmo Pro y sont envoyées à la prise de vue, et retéléchargées automatiquement sur tout autre appareil qui ne les a pas encore en cache local (IndexedDB). L'app affiche uniquement le quota de stockage **local du navigateur** (`navigator.storage.estimate()`), avec un message d'avertissement si le cache local est plein ; il n'existe pas encore de suivi ni d'alerte sur le volume utilisé côté bucket Supabase — à surveiller manuellement depuis le dashboard Supabase si besoin.

### État de la migration — ce qui est réellement partagé aujourd'hui

| Donnée | Statut |
|---|---|
| Photos (fichiers) | ✅ Partagées via Storage, consultables depuis n'importe quel appareil |
| Fiches descriptives (`bibliotheque.html`) | ✅ Partagées, écriture ligne par ligne |
| Métadonnées photos (`biens_photoimmo`) | ✅ Partagées, une ligne par bien (`id` = id du bien) : deux agents modifiant des biens différents en même temps ne s'écrasent plus mutuellement. (Avant : tout le lot stocké dans une seule ligne géante partagée par tous les biens.) |
| Registre inter-apps (`biens_registry`) | ✅ **Harmonisé** : `dossier.html`, `photoimmo.html` et `bibliotheque.html` utilisent désormais le même format d'écriture (une ligne par bien, `id` = identifiant normalisé du bien). La liaison automatique entre les 3 outils est donc fiable en usage multi-appareils. |
| Brouillons de blog (`blog_drafts`) | ✅ **Réellement partagés** : chaque brouillon est stocké dans sa propre ligne (`id` = id du brouillon) au lieu d'être regroupé sous un identifiant d'appareil (`deviceId`). Un brouillon créé par un collègue est désormais visible par tous les agents. |

Une migration automatique et silencieuse est effectuée au premier chargement de chaque page concernée : les anciennes lignes (format « une ligne géante par bucket/appareil ») sont éclatées en lignes individuelles, poussées vers Supabase, puis supprimées.

## Mode hors-ligne (Service Worker)

Chaque page du portail enregistre `sw.js`, un Service Worker qui met en cache l'interface (HTML/CSS/JS statiques, logo) pour permettre l'ouverture des pages même sans connexion réseau. Stratégie **network first, cache en secours** : le réseau est toujours tenté en premier pour avoir la version à jour, le cache ne sert qu'en cas d'échec réseau.

- Ne concerne que l'interface : les appels vers Supabase (données biens, photos, connexion) ne sont jamais interceptés et échouent normalement hors ligne, pour que chaque page gère l'erreur proprement.
- La liste des fichiers mis en cache (`FICHIERS_A_METTRE_EN_CACHE`) doit être tenue à jour à chaque ajout de fichier statique au portail, et le nom du cache (`NOM_CACHE`) doit être incrémenté à chaque changement de cette liste ou du contenu des fichiers, pour forcer la mise à jour chez les utilisateurs.
- **Installation robuste** : chaque fichier de la liste est mis en cache individuellement (`Promise.allSettled`) plutôt qu'en un seul bloc. Avant, un seul fichier introuvable (renommage, faute de frappe) faisait échouer silencieusement l'installation entière du Service Worker ; désormais un échec isolé est simplement loggué en console (`[sw.js] Échec de mise en cache : ...`) sans bloquer les autres.

## Modules front-end partagés

Pour éviter la duplication de code entre les pages, plusieurs briques communes sont factorisées dans des fichiers dédiés, chargés par les pages qui en ont besoin :

| Fichier | Rôle |
|---|---|
| `theme-early.js` | Applique le mode sombre/clair avant le premier rendu (anti-flash), chargé en tout premier dans `<head>`. Écoute aussi les changements de thème faits dans un autre onglet (`storage` event) pour rester synchronisé entre tous les onglets ouverts du portail, sans rechargement de page. |
| `theme.js` | Bascule manuelle du mode sombre (`initTheme()`, `toggleTheme()`), utilisée par la plupart des pages (indépendant du sélecteur `dark-toggle` propre à `photoimmo.html`). |
| `html-utils.js` | Échappement HTML commun (`escHtml()`) avant insertion de données (Supabase ou saisie utilisateur) dans du `innerHTML`. |
| `toast.js` / `toast.css` | Bulle de confirmation partagée (succès / avertissement / suppression), utilisée par `dossier.html`. Les appels sont mis en file d'attente (FIFO) : un nouveau toast n'écrase plus celui déjà affiché, il attend sa disparition avant de s'afficher à son tour. |
| `page-transition.js` / `page-transition.css` | Overlay de transition (logo qui pulse) affiché lors de la navigation entre les apps du portail depuis `index.html`, pour éviter un flash d'écran blanc pendant le chargement. |

## Dossier des biens (`dossier.html`)

Fiche centralisée par bien immobilier, qui réunit au même endroit tout ce qui est produit par les autres applications du portail (photos, description/annonce) et le suivi commercial du dossier :

- **Vue liste** sous forme de grille de cartes, une par bien, avec :
  - une **miniature** (photo la mieux notée si disponible dans PhotoImmo Pro, sinon icône par défaut) ;
  - un **badge de statut** coloré (À l'estimation, En mandat, Compromis signé, Vendu, En location, Loué, Archivé) ;
  - des **chips d'état** : avancement des photos (ex. `4/6` pièces clés), présence ou non d'une fiche description, et prix/loyer si renseigné ;
  - une **recherche** par adresse ou ville et un **filtre par statut** ;
  - un bouton **Nouveau bien** ouvrant une modale de création rapide (adresse, ville, type, statut) ;
  - suppression d'un bien directement depuis la carte, avec confirmation.
- **Vue détail** par bien, accessible en cliquant sur une carte :
  - **Informations générales** éditables : ville/quartier, type de bien, statut du dossier, prix/loyer, notes internes (sauvegardées automatiquement au changement) ;
  - **Bloc Photos** : aperçu des meilleures photos et barre de progression des pièces clés photographiées, avec lien direct vers la fiche du bien dans PhotoImmo Pro (ouverture ou création si elle n'existe pas encore) ;
  - **Bloc Description / annonce** : aperçu des informations clés de l'annonce (type, ville, pièces, surface, prix) si une fiche existe dans la Bibliothèque de prompts, avec lien direct vers celle-ci (ouverture ou création) ;
  - suppression du dossier avec modale de confirmation, précisant que les données déjà créées dans PhotoImmo et la Bibliothèque ne sont pas supprimées.
- **Registre partagé** (table Supabase `biens_registry`) : `dossier.html` est la source de vérité pour la liste des biens et leurs champs centraux (statut, prix, notes). Le format d'écriture (une ligne par bien) est désormais identique entre `dossier.html`, `photoimmo.html` et `bibliotheque.html`, ce qui rend la liaison automatique entre les 3 outils fiable en usage multi-appareils. Les aperçus photo/description affichés sur chaque carte sont désormais lus **directement depuis Supabase** (tables `biens_photoimmo` et `biens_bibliotheque`), et non plus depuis le cache local (`localStorage`) de PhotoImmo Pro et de la Bibliothèque : un bien créé ou modifié sur un autre appareil apparaît donc correctement, sans dépendre de l'état du poste courant. Ces 3 sources sont rechargées automatiquement à chaque retour au premier plan de l'onglet, pour rester à jour même si la page reste ouverte toute la journée. Seules les vignettes photo elles-mêmes restent mises en cache local (IndexedDB) pour un affichage instantané ; si une photo n'a jamais été ouverte sur ce poste, elle est retéléchargée à la volée depuis le bucket Supabase Storage.
- **Toasts de confirmation** (création, mise à jour, suppression, avertissement) et **icônes SVG inline** (aucun emoji), cohérents avec la charte graphique du portail.
- **Mode sombre** synchronisé sur les préférences système, comme les autres pages.

## Générateur de blog (`blog.html`)

Outil de rédaction assisté pour le blog de l'agence (actualités immobilières et vie locale), organisé en 4 grandes étapes :

- **Choix d'un modèle d'article** parmi 8 modèles répartis en 4 catégories : *Marché immobilier*, *Conseils pratiques*, *Vie locale*, *Gastronomie & Terroir* — avec filtre par catégorie et grille de sélection.
- **Renseignement des informations factuelles** via des champs dynamiques propres à chaque modèle (ville/secteur, chiffres, points clés, etc.), plus des réglages globaux : ton (factuel, chaleureux, institutionnel), longueur cible et date de publication.
- **Génération du prompt** : construction automatique d'un prompt éditorial strict (aucune information inventée, pas d'emoji ni de superlatif, conclusion invitant à contacter l'agence), avec possibilité de le copier ou de l'envoyer directement vers claude.ai.
- **Génération directe (BYOK)** : appel en direct à l'API Claude (Anthropic) ou Gemini (Google) depuis le navigateur, avec streaming de la réponse directement dans le formulaire de brouillon (titre, meta description, texte), clé API saisie par l'utilisateur et jamais stockée (voir section IA ci-dessous).
- **Gestion de brouillons** : sauvegarde, recherche, filtre par catégorie, tri, ouverture, modification et suppression (avec confirmation), formulaire de création/import manuel avec bouton de copie par champ, ainsi qu'un contrôle anti-emoji pour respecter la charte éditoriale. Sauvegardés en `localStorage` (cache local hors-ligne) avec synchronisation vers Supabase, une ligne par brouillon (`blog_drafts`) : un brouillon créé par un collègue est désormais visible et modifiable par tous les agents.
- **Mode sombre** synchronisé sur les préférences système, comme les autres pages du portail.
- Sécurité renforcée : Content-Security-Policy dédiée autorisant uniquement `api.anthropic.com`, `generativelanguage.googleapis.com` et le projet Supabase du portail.

## Caractéristiques techniques

- **Frontend 100 % statique** : HTML/CSS/JS vanilla, aucune dépendance externe via CDN — la librairie Supabase (`supabase-lib.js`) est vendorisée en local dans le dépôt.
- **Modules front-end partagés** (thème, échappement HTML, toast, transition entre pages) factorisés dans des fichiers dédiés plutôt que dupliqués sur chaque page — voir section « Modules front-end partagés » ci-dessus.
- **Mode hors-ligne** via Service Worker (`sw.js`) : interface utilisable sans réseau, données Supabase toujours en direct — voir section « Mode hors-ligne » ci-dessus.
- **Backend partagé Supabase** : base de données Postgres + authentification + stockage de fichiers, hébergé en région UE.
- **Stockage local en complément** : `localStorage` et `IndexedDB` restent utilisés comme cache rapide et copie de secours hors-ligne sur chaque poste, en plus de la synchro cloud.
- **Content-Security-Policy stricte** sur chaque page (`default-src 'self'`, `script-src 'self'`, `object-src 'none'`, `frame-ancestors 'self'`, `connect-src` limité au projet Supabase et, pour `blog.html`, aux API IA), aucun CDN externe autorisé.
- **Mode sombre** synchronisé sur les préférences système, avec bascule manuelle.

## Utilisation de l'IA (bibliothèque de prompts & générateur de blog)

La bibliothèque de prompts et le générateur de blog permettent tous deux de générer du contenu via l'API Claude (Anthropic) ou Gemini (Google) directement depuis le navigateur, en mode *BYOK* (Bring Your Own Key) :

- La clé API est saisie par l'utilisateur et reste **uniquement en mémoire du navigateur** le temps de la session — elle n'est jamais stockée ni transmise ailleurs qu'à l'API du fournisseur choisi.
- Aucune clé n'est incluse dans ce dépôt.

## RGPD

- Projet Supabase hébergé en région UE (Francfort ou Paris selon la configuration retenue à la création).
- DPA (accord de sous-traitance, art. 28 RGPD) à demander/signer auprès de Supabase — disponible gratuitement sur simple demande, quel que soit le plan.
- Les données stockées sont majoritairement des données métier (biens, photos de biens, contenus marketing) : éviter d'ajouter des champs de données personnelles nominatives (nom/téléphone de client) dans ces tables sans réévaluer les obligations RGPD associées.

## Déploiement

Le site est publié automatiquement par **GitHub Pages** à chaque `push` sur la branche `main` (source : *Deploy from a branch*, racine `/`).

## Structure du dépôt

```
App-centrale/
├── index.html                        # Portail d'accueil
├── login.html                        # Connexion (compte agence Supabase)
├── accepter-invitation.html          # Activation de compte via lien d'invitation
├── reinitialiser-mdp.html            # Définition d'un nouveau mot de passe
├── bibliotheque.html                 # Bibliothèque de prompts IA
├── documentation_bibliotheque.html   # Doc de la bibliothèque
├── photoimmo.html                    # PhotoImmo Pro
├── dossier.html                      # Dossier des biens (fiche centralisée)
├── blog.html                         # Générateur de blog
├── test-connexion.html               # Page technique de diagnostic Supabase
├── supabase-lib.js                   # Librairie supabase-js vendorisée (pas de CDN)
├── supabase-client.js                # Connexion Supabase commune à toutes les pages
├── auth-guard.js                     # Garde d'authentification (redirige vers login.html)
├── theme-early.js                    # Application du thème avant le premier rendu (anti-flash)
├── theme.js                          # Bascule manuelle du mode sombre
├── html-utils.js                     # Échappement HTML commun (escHtml)
├── toast.js / toast.css              # Bulle de confirmation partagée
├── page-transition.js / page-transition.css  # Overlay de transition entre pages
├── sw.js                             # Service Worker (mode hors-ligne de l'interface)
├── logo_laforet.png                  # Logo de l'agence
└── README.md
```

## Usage interne

Ce dépôt est destiné à un usage interne à l'agence Laforêt Pithiviers. Le dépôt est public sur GitHub mais ne contient aucune donnée client ni identifiant — les clés Supabase visibles dans le code sont des clés publiques (`anon`), protégées par les règles de sécurité côté base de données, pas des secrets.

---

<p align="center"><sub>Laforêt Pithiviers · Usage interne</sub></p>
