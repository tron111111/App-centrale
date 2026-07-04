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
| [`index.html`](index.html) | Portail d'accueil — sélection de l'application à ouvrir. |
| [`bibliotheque.html`](bibliotheque.html) | Bibliothèque de prompts IA (Claude & Gemini) : annonces, emails, réseaux sociaux, prospection et administratif. Comprend un générateur d'annonce centralisé et un mode sombre. |
| [`photoimmo.html`](photoimmo.html) | PhotoImmo Pro — notation et gestion des photos de biens immobiliers pièce par pièce, avec guide de prise de vue et moteur de scoring multi-critères (netteté, exposition, contraste, balance des blancs, cadrage). |
| [`documentation_bibliotheque.html`](documentation_bibliotheque.html) | Documentation d'utilisation de la bibliothèque de prompts. |

## Caractéristiques techniques

- **100 % statique** : HTML/CSS/JS vanilla, aucune dépendance externe (icônes en SVG inline).
- **Stockage local uniquement** : les données (biens enregistrés, préférences, thème) sont conservées via `localStorage`, rien n'est envoyé à un serveur — sauf appel volontaire à une API IA (voir ci-dessous).
- **Content-Security-Policy stricte** sur chaque page (`default-src 'self'`, `object-src 'none'`, `frame-ancestors 'self'`, etc.).
- **Mode sombre** synchronisé sur les préférences système, avec bascule manuelle.

## Utilisation de l'IA (bibliothèque de prompts)

La bibliothèque de prompts permet de générer du contenu via l'API Claude (Anthropic) ou Gemini (Google) directement depuis le navigateur, en mode *BYOK* (Bring Your Own Key) :

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
├── logo_laforet.png                  # Logo de l'agence
└── README.md
```

## Usage interne

Ce dépôt est destiné à un usage interne à l'agence Laforêt Pithiviers. Le dépôt est public sur GitHub mais ne contient aucune donnée client ni identifiant.

---

<p align="center"><sub>Laforêt Pithiviers · Usage interne</sub></p>
