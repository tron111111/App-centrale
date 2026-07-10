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
| [`login.html`](login.html) | Page de connexion commune à tout le portail (compte agence Supabase). |
| [`test-connexion.html`](test-connexion.html) | Page technique de diagnostic — vérifie que le navigateur arrive à joindre Supabase. Pas destinée aux agents. |

## Authentification

Tout le portail est protégé par un compte agence (email + mot de passe), géré via **Supabase Auth** :

- Chaque page protégée charge `supabase-lib.js` → `supabase-client.js` → `auth-guard.js`, dans cet ordre. `auth-guard.js` redirige automatiquement vers `login.html` si personne n'est connecté.
- Les comptes agents sont créés manuellement dans le dashboard Supabase (Authentication > Users) — il n'y a pas d'auto-inscription.
- La clé utilisée côté navigateur est la clé **`anon` publique** de Supabase : ce n'est pas un secret (elle est conçue pour être visible côté client), c'est la sécurité **Row Level Security** côté base de données qui protège réellement les données — seuls les comptes authentifiés peuvent lire/écrire.

## Backend partagé (Supabase)

Projet Supabase dédié, hébergé en région UE, avec DPA signé (voir section RGPD plus bas). Deux briques sont utilisées :

**Base de données (Postgres)** — une table par collection de données, chaque ligne portant un `id` et une colonne `data` en JSONB :

| Table | Alimentée par | Contenu |
|---|---|---|
| `biens_registry` | `dossier.html`, `photoimmo.html` | Registre reliant un même bien entre les 3 apps (voir limite connue ci-dessous) |
| `biens_bibliotheque` | `bibliotheque.html` | Fiches descriptives des biens (annonces) |
| `biens_photoimmo` | `photoimmo.html` | Métadonnées des photos par bien (scoring, pièces, dates) |
| `blog_drafts` | `blog.html` | Brouillons d'articles de blog (voir limite connue ci-dessous) |

Toutes les tables sont protégées par des policies **Row Level Security** limitant l'accès aux seuls comptes authentifiés du portail.

**Storage (fichiers)** — bucket privé **`photoimmo-photos`** : les vignettes photo de PhotoImmo Pro y sont envoyées à la prise de vue, et retéléchargées automatiquement sur tout autre appareil qui ne les a pas encore en cache local (IndexedDB). Limite fixée à 50 Mo pour l'ensemble du bucket, avec avertissement affiché dans l'app dès 45 Mo utilisés.

### État de la migration — ce qui est réellement partagé aujourd'hui

| Donnée | Statut |
|---|---|
| Photos (fichiers) | ✅ Partagées via Storage, consultables depuis n'importe quel appareil |
| Fiches descriptives (`bibliotheque.html`) | ✅ Partagées, écriture ligne par ligne |
| Métadonnées photos (`biens_photoimmo`) | ⚠️ Synchronisées, mais en une seule ligne pour tout le bucket : deux agents modifiant des biens différents en même temps peuvent s'écraser mutuellement |
| Registre inter-apps (`biens_registry`) | ❌ **Incohérent** : `dossier.html`, `photoimmo.html` et `bibliotheque.html` n'utilisent pas le même format d'écriture (voir détail technique dans le code). La liaison automatique entre les 3 outils n'est donc pas fiable en usage multi-appareils tant que ce n'est pas harmonisé. |
| Brouillons de blog (`blog_drafts`) | ❌ **Pas réellement partagés** : chaque appareil sauvegarde ses propres brouillons sous son propre identifiant (`deviceId`). C'est un backup cloud par poste, pas un partage entre agents. |

Ces deux derniers points sont les prochains chantiers pour que le partage soit complet et fiable.

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
- **Registre partagé** (table Supabase `biens_registry`) : `dossier.html` est la source de vérité pour la liste des biens et leurs champs centraux (statut, prix, notes). Les aperçus photo/description affichés sur chaque carte sont lus depuis le cache local (`localStorage`) de PhotoImmo Pro et de la Bibliothèque — ils reflètent donc l'état du poste courant, pas nécessairement celui d'un autre appareil tant que le point ci-dessus n'est pas harmonisé.
- **Toasts de confirmation** (création, mise à jour, suppression, avertissement) et **icônes SVG inline** (aucun emoji), cohérents avec la charte graphique du portail.
- **Mode sombre** synchronisé sur les préférences système, comme les autres pages.

## Générateur de blog (`blog.html`)

Outil de rédaction assisté pour le blog de l'agence (actualités immobilières et vie locale), organisé en 4 grandes étapes :

- **Choix d'un modèle d'article** parmi 8 modèles répartis en 4 catégories : *Marché immobilier*, *Conseils pratiques*, *Vie locale*, *Gastronomie & Terroir* — avec filtre par catégorie et grille de sélection.
- **Renseignement des informations factuelles** via des champs dynamiques propres à chaque modèle (ville/secteur, chiffres, points clés, etc.), plus des réglages globaux : ton (factuel, chaleureux, institutionnel), longueur cible et date de publication.
- **Génération du prompt** : construction automatique d'un prompt éditorial strict (aucune information inventée, pas d'emoji ni de superlatif, conclusion invitant à contacter l'agence), avec possibilité de le copier ou de l'envoyer directement vers claude.ai.
- **Génération directe (BYOK)** : appel en direct à l'API Claude (Anthropic) ou Gemini (Google) depuis le navigateur, avec streaming de la réponse directement dans le formulaire de brouillon (titre, meta description, texte), clé API saisie par l'utilisateur et jamais stockée (voir section IA ci-dessous).
- **Gestion de brouillons** : sauvegarde, recherche, filtre par catégorie, tri, ouverture, modification et suppression (avec confirmation), formulaire de création/import manuel avec bouton de copie par champ, ainsi qu'un contrôle anti-emoji pour respecter la charte éditoriale. Sauvegardés en `localStorage` avec synchronisation vers Supabase (voir limite connue plus haut : synchro actuellement par appareil, pas encore partagée entre agents).
- **Mode sombre** synchronisé sur les préférences système, comme les autres pages du portail.
- Sécurité renforcée : Content-Security-Policy dédiée autorisant uniquement `api.anthropic.com`, `generativelanguage.googleapis.com` et le projet Supabase du portail.

## Caractéristiques techniques

- **Frontend 100 % statique** : HTML/CSS/JS vanilla, aucune dépendance externe via CDN — la librairie Supabase (`supabase-lib.js`) est vendorisée en local dans le dépôt.
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
├── bibliotheque.html                 # Bibliothèque de prompts IA
├── documentation_bibliotheque.html   # Doc de la bibliothèque
├── photoimmo.html                    # PhotoImmo Pro
├── dossier.html                      # Dossier des biens (fiche centralisée)
├── blog.html                         # Générateur de blog
├── test-connexion.html               # Page technique de diagnostic Supabase
├── supabase-lib.js                   # Librairie supabase-js vendorisée (pas de CDN)
├── supabase-client.js                # Connexion Supabase commune à toutes les pages
├── auth-guard.js                     # Garde d'authentification (redirige vers login.html)
├── logo_laforet.png                  # Logo de l'agence
└── README.md
```

## Usage interne

Ce dépôt est destiné à un usage interne à l'agence Laforêt Pithiviers. Le dépôt est public sur GitHub mais ne contient aucune donnée client ni identifiant — les clés Supabase visibles dans le code sont des clés publiques (`anon`), protégées par les règles de sécurité côté base de données, pas des secrets.

---

<p align="center"><sub>Laforêt Pithiviers · Usage interne</sub></p>
