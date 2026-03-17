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