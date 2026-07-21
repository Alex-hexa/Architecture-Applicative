# LeMauvaisCoin
La version "Lite" du Bon Coin avec une architecture N-tiers.

## 🚀 Fonctionnalités Principales
- **Frontend (React / Vite)** : Authentification (Inscription/Connexion), gestion du profil, création/édition d'annonces, gestion des favoris et suivi complet de l'historique des achats.
- **Backend (Node.js / Express)** : API REST sécurisée par JWT, connectée à une base de données PostgreSQL (via Supabase).

## 🧠 Algorithmes et Complexité
Le système intègre un moteur de recommandation performant basé sur plusieurs principes avancés :
- **Design Patterns** : Utilisation des patterns *Singleton* (configuration globale), *Factory* (instanciation dynamique des stratégies de tri) et *Observer* (gestion du cycle de vie des commandes).
- **Scoring de Pertinence** : Stratégies interchangeables (Barycentre sémantique et Scoring pondéré) qui personnalisent l'affichage selon les favoris de l'utilisateur.
- **Complexité Optimisée** : Les algorithmes sont conçus pour tenir la charge avec une complexité maximale de $O(n \log n)$. L'utilisation de dictionnaires (Map) offre un accès direct en $O(1)$ et permet d'éviter les boucles imbriquées (réduisant le coût à $O(n+m)$).

## 🔍 Filtres et Tris
### Articles :
- **Filtres** : Date de parution, Prix min/max, Titre, Catégorie.
- **Tris** : Pertinence (Score), Date de publication, Prix (croissant/décroissant).

### Commandes :
- **Filtres** : Statut (En cours, Expédiée, Livrée, Annulée), Plage de dates.
- **Tris** : Date (décroissante par défaut).

## 🏗 Architecture
![Architecture](docs/image/LeMauvaisCoin_Architecture_N-tiers.png)