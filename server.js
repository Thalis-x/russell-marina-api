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
require('dotenv').config({ quiet: true });

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
      { url: 'https://russell-marina-api-b67g.onrender.com', description: 'Serveur de production' },
      { url: 'http://localhost:3000', description: 'Serveur de développement' },
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

// =============================================================================
// Routes
// =============================================================================

// Page d'accueil (route publique)
app.get('/', (req, res) => {
  res.render('index', { title: 'Accueil', error: null });
});

// Authentification (routes publiques)
app.use('/', authRoutes);

// API REST (routes protégées par JWT)
app.use('/catways', catwayRoutes);
app.use('/users', userRoutes);

// Routes web du tableau de bord (protégées par cookie JWT)
app.use('/dashboard', webRoutes);

// =============================================================================
// Gestion des erreurs 404
// =============================================================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} introuvable.`,
  });
});

// =============================================================================
// Démarrage du serveur
// =============================================================================
const PORT = process.env.PORT || 3000;

//visible sur le terminal
app.listen(PORT, () => {
  console.log('');
  console.log(`      Port de Plaisance Russell — API démarrée`);
  console.log(`   Application : http://localhost:${PORT}`);
  console.log(`   API Docs    : http://localhost:${PORT}/api-docs`);
  console.log(`   Base de données : ${process.env.MONGODB_URI}`);
  console.log('');
});

module.exports = app;
