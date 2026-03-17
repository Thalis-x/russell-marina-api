// POINT D'ENTRÉE DE L'APPLICATION
//
// Ce fichier :
//   1. Charge les variables d'environnement depuis .env
//   2. Configure Express (moteur de vues, middlewares, fichiers statiques)
//   3. Connecte la base de données MongoDB
//   4. Enregistre toutes les routes (API + web)
//   5. Configure la documentation Swagger
//   6. Démarre le serveur HTTP
// =============================================================================

// Charger les variables d'environnement EN PREMIER (avant tout require qui en a besoin)
require('dotenv').config();

const express      = require('express');
const cookieParser = require('cookie-parser');
const path         = require('path');
const connectDB    = require('./config/db');

// --- Import des routes ---
const authRoutes         = require('./routes/auth');
const catwayRoutes       = require('./routes/catways');
const reservationRoutes  = require('./routes/reservations');
const userRoutes         = require('./routes/users');
const webRoutes          = require('./routes/web');