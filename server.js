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

// --- Swagger (documentation API) ---
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi    = require('swagger-ui-express');

// =============================================================================
// Connexion MongoDB
// =============================================================================
connectDB();

// =============================================================================
// Initialisation d'Express
// =============================================================================
const app = express();

// --- Middlewares globaux ---

// Parsing du corps des requêtes JSON (pour les appels API)
app.use(express.json());

// Parsing des formulaires HTML (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: true }));

// Parsing des cookies (utilisé pour le token JWT)
app.use(cookieParser());

// Fichiers statiques (CSS, JS, images) servis depuis /public
app.use(express.static(path.join(__dirname, 'public')));

// --- Moteur de vues EJS ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// =============================================================================
// Documentation Swagger
// =============================================================================
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API Port de Plaisance Russell',
      version: '1.0.0',
      description: `
## API de gestion du Port de Plaisance Russell

Cette API privée permet à la capitainerie de gérer :
- Les **catways** (appontements d'amarrage)
- Les **réservations** des plaisanciers
- Les **utilisateurs** de la capitainerie

### Authentification
L'API utilise des **tokens JWT**. Pour accéder aux routes protégées :
1. Appelez \`POST /login\` avec vos identifiants
2. Copiez le token reçu
3. Cliquez sur "Authorize" et entrez : \`Bearer <votre_token>\`
      `,
      contact: { name: 'Capitainerie de Russell' },
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Serveur de développement' },
      { url: process.env.PRODUCTION_URL || '', description: 'Serveur de production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  // Chercher les commentaires JSDoc dans tous les fichiers de routes
  apis: ['./routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'API Russell - Documentation',

  customJsStr: `
    (function () {
      function watchToggle() {
        const btn = document.querySelector('.dark-mode-toggle button');
        if (!btn) return false;

        // Au clic, sauvegarde le NOUVEL état (après toggle)
        btn.addEventListener('click', function () {
          const isDark = document.documentElement.classList.contains('dark-mode');
          localStorage.setItem('swaggerDarkMode', !isDark);
        });

        // Applique le dark mode sauvegardé
        if (localStorage.getItem('swaggerDarkMode') === 'true') {
          btn.click();
        }

        return true;
      }

      const interval = setInterval(function () {
        if (watchToggle()) clearInterval(interval);
      }, 200);

      setTimeout(function () { clearInterval(interval); }, 10000);
    })();
  `,
}));