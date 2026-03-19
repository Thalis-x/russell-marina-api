# russell-marina-api
Application web de gestion des réservations de catways pour le port de Russell, avec API privée sécurisée pour gérer les disponibilités et les attributions d’amarrage.

## Application en ligne
- Application : https://russell-marina-api-b67g.onrender.com
- Documentation API : https://russell-marina-api-b67g.onrender.com/api-docs
- Email : admin@russell.fr
- Mot de passe : admin123

## Technologies

- **Backend** : Node.js + Express.js
- **Base de données** : MongoDB + Mongoose
- **Authentification** : JWT (JSON Web Tokens) + cookies HTTP-only
- **Mots de passe** : bcryptjs (hachage + sel)
- **Frontend** : EJS (templates HTML)
- **Documentation** : Swagger UI (OpenAPI 3.0)

## Installation et démarrage

### 1. Cloner le dépôt

```bash
git clone https://github.com/Thalis-x/russell-marina-api.git
cd russell-marina-api
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Éditez le fichier `.env` avec vos valeurs :

```env
MONGODB_URI=mongodb://localhost:27017/russell_marina
JWT_SECRET=votre_secret_tres_long_et_securise
JWT_EXPIRES_IN=24h
PORT=3000
```

### 4. Initialiser la base de données

Ce script importe les catways, réservations et crée un compte admin :

```bash
node seed.js
```

Compte créé : `admin@russell.fr` / `admin123`

### 5. Lancer le serveur

```bash
# Développement (avec rechargement automatique)
npm run dev

# Production
npm start
```

### 6. Accéder à l'application

| URL | Description |
|-----|-------------|
| http://localhost:3000 | Page d'accueil + connexion |
| http://localhost:3000/dashboard | Tableau de bord |
| http://localhost:3000/api-docs | Documentation Swagger |

---

##  Routes API

### Authentification

| Méthode | Route | Description |
|---------|-------|-------------|
| POST | `/login` | Connexion (retourne un token JWT) |
| GET | `/logout` | Déconnexion |

### Catways ( JWT requis)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/catways` | Lister tous les catways |
| GET | `/catways/:id` | Détail d'un catway |
| POST | `/catways` | Créer un catway |
| PUT | `/catways/:id` | Modifier l'état d'un catway |
| DELETE | `/catways/:id` | Supprimer un catway |

### Réservations ( JWT requis)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/catways/:id/reservations` | Lister les réservations d'un catway |
| GET | `/catways/:id/reservations/:idReservation` | Détail d'une réservation |
| POST | `/catways/:id/reservations` | Créer une réservation |
| PUT | `/catways/:id/reservations/:idReservation` | Modifier une réservation |
| DELETE | `/catways/:id/reservations/:idReservation` | Supprimer une réservation |

### Utilisateurs ( JWT requis)

| Méthode | Route | Description |
|---------|-------|-------------|
| GET | `/users` | Lister les utilisateurs |
| GET | `/users/:email` | Détail d'un utilisateur |
| POST | `/users` | Créer un utilisateur |
| PUT | `/users/:email` | Modifier un utilisateur |
| DELETE | `/users/:email` | Supprimer un utilisateur |

---

## Architecture MVC

Le projet suit une architecture **MVC (Modèle - Vue - Contrôleur)** :

| Couche | Dossier | Rôle |
|---|---|---|
| **Modèle** | `models/` | Schémas MongoDB et validation des données |
| **Vue** | `views/` | Templates EJS pour le rendu HTML |
| **Contrôleur** | `controllers/` | Logique métier séparée des routes |
| **Routes** | `routes/` | Définition des endpoints et appel aux controllers |


## Structure du projet
```
russell-marina-api/
├── server.js                  # Point d'entrée, configuration Express
├── seed.js                    # Script d'initialisation de la DB
├── .env.example               # Template des variables d'environnement
├── config/
│   └── db.js                  # Connexion MongoDB
├── models/
│   ├── User.js                # Modèle utilisateur (avec hachage mdp)
│   ├── Catway.js              # Modèle catway
│   └── Reservation.js         # Modèle réservation
├── controllers/
│   ├── authController.js      # Logique métier authentification
│   ├── catwayController.js    # Logique métier catways
│   ├── reservationController.js # Logique métier réservations
│   └── userController.js      # Logique métier utilisateurs
├── middleware/
│   └── auth.js                # Middleware JWT (protect + protectWeb)
├── routes/
│   ├── auth.js                # POST /login, GET /logout
│   ├── catways.js             # CRUD catways (API REST)
│   ├── reservations.js        # CRUD réservations (API REST)
│   ├── users.js               # CRUD utilisateurs (API REST)
│   └── web.js                 # Routes du tableau de bord HTML
├── views/
│   ├── index.ejs              # Page d'accueil + connexion
│   ├── dashboard.ejs          # Tableau de bord (données via fetch)
│   ├── catways.ejs            # Gestion des catways
│   ├── reservations.ejs       # Gestion des réservations d'un catway
│   ├── all-reservations.ejs   # Liste de toutes les réservations
│   ├── users.ejs              # Gestion des utilisateurs
│   └── partials/              # Fragments réutilisables (nav, head)
├── public/
│   └── css/style.css          # Feuille de style
└── data/
    ├── catways.json           # Données initiales
    └── reservations.json
```

---

##  Sécurité

- Mots de passe hachés avec **bcryptjs** (12 rounds)
- Tokens JWT stockés en **cookie HTTP-only** (inaccessibles au JavaScript)
- Validation Mongoose sur tous les champs
- Impossible de modifier `catwayNumber` et `catwayType`
- Un utilisateur ne peut pas se supprimer lui-même
- Vérification des conflits de réservations

---

##  Déploiement (Render)

1. Pusher le code sur GitHub
2. Créer un compte sur [render.com](https://render.com)
3. "New Web Service" → connecter le repo GitHub
4. Configurer les variables d'environnement dans Render :
   - `MONGODB_URI` → URI MongoDB Atlas
   - `JWT_SECRET` → clé secrète longue
   - `NODE_ENV` → `production`
5. Build command : `npm install`
6. Start command : `npm start`

> MongoDB Atlas (gratuit) : https://www.mongodb.com/atlas

