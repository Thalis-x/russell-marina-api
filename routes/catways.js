// ROUTES CATWAYS — CRUD complet

// GET    /catways              → Liste tous les catways
// GET    /catways/:id          → Détail d'un catway (id = catwayNumber)
// POST   /catways              → Créer un catway
// PUT    /catways/:id          → Modifier l'état d'un catway (état uniquement !)
// DELETE /catways/:id          → Supprimer un catway

// Toutes les routes sont protégées par le middleware JWT "protect".

const express          = require('express');
const { protect }      = require('../middleware/auth');
const catwayController = require('../controllers/catwayController');

const router = express.Router();

// Applique le middleware d'authentification sur TOUTES les routes de ce fichier
router.use(protect);

// =============================================================================
// GET /catways — Lister tous les catways
// =============================================================================

/**
 * @swagger
 * /catways:
 *   get:
 *     summary: Récupère la liste de tous les catways
 *     tags: [Catways]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des catways
 */
router.get('/', catwayController.getAll);

// =============================================================================
// GET /catways/:id — Détail d'un catway
// =============================================================================

/**
 * @swagger
 * /catways/{id}:
 *   get:
 *     summary: Récupère les détails d'un catway
 *     tags: [Catways]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Numéro du catway
 *     responses:
 *       200:
 *         description: Détails du catway
 *       404:
 *         description: Catway non trouvé
 */
router.get('/:id', catwayController.getOne);

// =============================================================================
// POST /catways — Créer un catway
// =============================================================================

/**
 * @swagger
 * /catways:
 *   post:
 *     summary: Crée un nouveau catway
 *     tags: [Catways]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [catwayNumber, catwayType, catwayState]
 *             properties:
 *               catwayNumber:
 *                 type: integer
 *               catwayType:
 *                 type: string
 *                 enum: [long, short]
 *               catwayState:
 *                 type: string
 *     responses:
 *       201:
 *         description: Catway créé
 *       400:
 *         description: Données invalides
 */
router.post('/', catwayController.create);

// =============================================================================
// PUT /catways/:id — Modifier l'état d'un catway
// IMPORTANT : seul catwayState est modifiable (catwayNumber et catwayType ne le sont PAS)
// =============================================================================

/**
 * @swagger
 * /catways/{id}:
 *   put:
 *     summary: Modifie l'état d'un catway (catwayState uniquement)
 *     tags: [Catways]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [catwayState]
 *             properties:
 *               catwayState:
 *                 type: string
 *     responses:
 *       200:
 *         description: Catway mis à jour
 *       404:
 *         description: Catway non trouvé
 */
router.put('/:id', catwayController.update);

// =============================================================================
// DELETE /catways/:id — Supprimer un catway
// =============================================================================

/**
 * @swagger
 * /catways/{id}:
 *   delete:
 *     summary: Supprime un catway
 *     tags: [Catways]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Catway supprimé
 *       404:
 *         description: Catway non trouvé
 */
router.delete('/:id', catwayController.remove);

// Monter le router des réservations en sous-ressource
const reservationRoutes = require('./reservations');
router.use('/:id/reservations', reservationRoutes);

module.exports = router;