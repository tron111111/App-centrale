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

Ce dépôt héberge un ensemble d'outils web internes utilisés au quotidien par l'agence Laforêt Pithiviers. Toutes les applications sont des pages HTML autonomes (aucun serveur, aucune base de données) déployées via **GitHub Pages**.

## Applications

| Page | Description |
|---|---|
| [`index.html`](index.html) | Portail d'accueil — sélection de l'application à ouvrir, avec barre de recherche. |
| [`bibliotheque.html`](bibliotheque.html) | Bibliothèque de prompts IA (Claude & Gemini) : annonces, emails, réseaux sociaux, prospection et administratif. Comprend un générateur d'annonce centralisé et un mode sombre. |
| [`photoimmo.html`](photoimmo.html) | PhotoImmo Pro — notation et gestion des photos de biens immobiliers pièce par pièce, avec guide de prise de vue et moteur de scoring multi-critères (netteté, exposition, contraste, balance des blancs, cadrage). |
| [`dossier.html`](dossier.html) | Dossier des biens — fiche centralisée par bien : informations générales, statut, prix, notes, et liens automatiques vers les photos (PhotoImmo Pro) et la fiche descriptive (Bibliothèque de prompts). |
| [`blog.html`](blog.html) | Générateur de blog — création d'articles pour le blog de l'agence à partir de modèles thématiques, génération directe via Claude ou Gemini (BYOK), mise en forme automatique et gestion de brouillons. |
| [`documentation_bibliotheque.html`](documentation_bibliotheque.html) | Documentation d'utilisation de la bibliothèque de prompts. |

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
- **Registre partagé** (`localStorage`, clé `laforet_biens_registry`) : `dossier.html` est la source de vérité pour la liste des biens et leurs champs centraux (statut, prix, notes) ; il lit sans jamais les modifier les données existantes de PhotoImmo Pro (`photoimmo_pro_biens`) et de la Bibliothèque (`laforet_biens_saved`) pour rapprocher automatiquement un même bien entre les trois applications.
- **Toasts de confirmation** (création, mise à jour, suppression, avertissement) et **icônes SVG inline** (aucun emoji), cohérents avec la charte graphique du portail.
- **Mode sombre** synchronisé sur les préférences système, comme les autres pages.

## Générateur de blog (`blog.html`)

Outil de rédaction assisté pour le blog de l'agence (actualités immobilières et vie locale), organisé en 4 grandes étapes :

- **Choix d'un modèle d'article** parmi 8 modèles répartis en 4 catégories : *Marché immobilier*, *Conseils pratiques*, *Vie locale*, *Gastronomie & Terroir* — avec filtre par catégorie et grille de sélection.
- **Renseignement des informations factuelles** via des champs dynamiques propres à chaque modèle (ville/secteur, chiffres, points clés, etc.), plus des réglages globaux : ton (factuel, chaleureux, institutionnel), longueur cible et date de publication.
- **Génération du prompt** : construction automatique d'un prompt éditorial strict (aucune information inventée, pas d'emoji ni de superlatif, conclusion invitant à contacter l'agence), avec possibilité de le copier ou de l'envoyer directement vers claude.ai.
- **Génération directe (BYOK)** : appel en direct à l'API Claude (Anthropic) ou Gemini (Google) depuis le navigateur avec streaming de la réponse, réponse éditable en ligne, et clé API saisie par l'utilisateur (jamais stockée, voir section IA ci-dessous).
- **Mise en forme automatique de l'article** : parsing du texte généré (titre, meta description, corps en Markdown simplifié) et conversion en HTML (titres, listes, gras), avec estimation du temps de lecture.
- **Aperçu et édition de l'article** : titre et corps modifiables directement dans l'aperçu, copie du texte brut ou du code HTML prêt à publier.
- **Gestion de brouillons** (stockés en `localStorage`) : sauvegarde, recherche, filtre par catégorie, tri, ouverture, modification et suppression (avec confirmation), ainsi qu'un formulaire d'import manuel d'un texte externe (avec contrôle anti-emoji pour respecter la charte éditoriale).
- **Mode sombre** synchronisé sur les préférences système, comme les autres pages du portail.
- Sécurité renforcée : Content-Security-Policy dédiée autorisant uniquement `api.anthropic.com` et `generativelanguage.googleapis.com`, et collage forcé en texte brut dans la zone de réponse IA pour éviter l'injection de HTML.

## Caractéristiques techniques

- **100 % statique** : HTML/CSS/JS vanilla, aucune dépendance externe (icônes en SVG inline).
- **Stockage local uniquement** : les données (biens enregistrés, préférences, thème) sont conservées via `localStorage`, rien n'est envoyé à un serveur — sauf appel volontaire à une API IA (voir ci-dessous).
- **Content-Security-Policy stricte** sur chaque page (`default-src 'self'`, `object-src 'none'`, `frame-ancestors 'self'`, etc.).
- **Mode sombre** synchronisé sur les préférences système, avec bascule manuelle.

## Utilisation de l'IA (bibliothèque de prompts & générateur de blog)

La bibliothèque de prompts et le générateur de blog permettent tous deux de générer du contenu via l'API Claude (Anthropic) ou Gemini (Google) directement depuis le navigateur, en mode *BYOK* (Bring Your Own Key) :

- La clé API est saisie par l'utilisateur et reste **uniquement en mémoire du navigateur** le temps de la session — elle n'est jamais stockée ni transmise ailleurs qu'à l'API du fournisseur choisi.
- Aucune clé n'est incluse dans ce dépôt.

## Déploiement

Le site est publié automatiquement par **GitHub Pages** à chaque `push` sur la branche `main` (source : *Deploy from a branch*, racine `/`).

## Structure du dépôt

```
App-centrale/
├── index.html                        # Portail d'accueil
├── bibliotheque.html                 # Bibliothèque de prompts IA
├── documentation_bibliotheque.html   # Doc de la bibliothèque
├── photoimmo.html                    # PhotoImmo Pro
├── dossier.html                      # Dossier des biens (fiche centralisée)
├── blog.html                         # Générateur de blog
├── logo_laforet.png                  # Logo de l'agence
└── README.md
```

## Usage interne

Ce dépôt est destiné à un usage interne à l'agence Laforêt Pithiviers. Le dépôt est public sur GitHub mais ne contient aucune donnée client ni identifiant.

---

<p align="center"><sub>Laforêt Pithiviers · Usage interne</sub></p>
