// ROUTES CATWAYS — CRUD complet

// GET    /catways              → Liste tous les catways
// GET    /catways/:id          → Détail d'un catway (id = catwayNumber)
// POST   /catways              → Créer un catway
// PUT    /catways/:id          → Modifier l'état d'un catway (état uniquement !)
// DELETE /catways/:id          → Supprimer un catway

// Toutes les routes sont protégées par le middleware JWT "protect".


const express = require('express');
const Catway = require('../models/Catway');
const Reservation = require('../models/Reservation');
const { protect } = require('../middleware/auth');

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
router.get('/', async (req, res) => {
  try {
    // .sort({ catwayNumber: 1 }) → triés par numéro croissant
    const catways = await Catway.find().sort({ catwayNumber: 1 });

    res.status(200).json({
      success: true,
      count: catways.length,
      data: catways,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

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
router.get('/:id', async (req, res) => {
  try {
    // On cherche par catwayNumber (pas par _id MongoDB)
    const catway = await Catway.findOne({ catwayNumber: req.params.id });

    if (!catway) {
      return res.status(404).json({
        success: false,
        message: `Catway numéro ${req.params.id} introuvable.`,
      });
    }

    res.status(200).json({ success: true, data: catway });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

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
router.post('/', async (req, res) => {
  try {
    const catway = await Catway.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Catway créé avec succès.',
      data: catway,
    });
  } catch (error) {
    // Gestion de l'erreur d'unicité MongoDB (code 11000)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: `Le numéro de catway ${req.body.catwayNumber} existe déjà.`,
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

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
router.put('/:id', async (req, res) => {
  try {
    // On n'extrait QUE catwayState du body — catwayNumber et catwayType sont ignorés
    const { catwayState } = req.body;

    if (!catwayState) {
      return res.status(400).json({
        success: false,
        message: 'Seul catwayState peut être modifié.',
      });
    }

    const catway = await Catway.findOneAndUpdate(
      { catwayNumber: req.params.id },
      { catwayState },
      { new: true, runValidators: true }, // new: true → retourne le document mis à jour
    );

    if (!catway) {
      return res.status(404).json({
        success: false,
        message: `Catway numéro ${req.params.id} introuvable.`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'État du catway mis à jour.',
      data: catway,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

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
router.delete('/:id', async (req, res) => {
  try {
    const catway = await Catway.findOneAndDelete({
      catwayNumber: req.params.id,
    });

    if (!catway) {
      return res.status(404).json({
        success: false,
        message: `Catway numéro ${req.params.id} introuvable.`,
      });
    }

    // On supprime aussi toutes les réservations liées à ce catway
    await Reservation.deleteMany({ catwayNumber: req.params.id });

    res.status(200).json({
      success: true,
      message: `Catway numéro ${req.params.id} supprimé avec succès.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Monter le router des réservations en sous-ressource
const reservationRoutes = require('./reservations');
router.use('/:id/reservations', reservationRoutes);

module.exports = router;