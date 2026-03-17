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