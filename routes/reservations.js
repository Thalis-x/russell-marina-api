// ROUTES RÉSERVATIONS — Sous-ressource de Catway

// Les réservations sont liées à un catway spécifique.
// L'URL reflète cette relation : /catways/:id/reservations

// GET    /catways/:id/reservations                → Toutes les réservations d'un catway
// GET    /catways/:id/reservations/:idReservation → Détail d'une réservation
// POST   /catways/:id/reservations                → Créer une réservation
// PUT    /catways/:id/reservations/:idReservation → Modifier une réservation
// DELETE /catways/:id/reservations/:idReservation → Supprimer une réservation
// =============================================================================

const express     = require('express');
const Reservation = require('../models/Reservation');
const Catway      = require('../models/Catway');
const { protect } = require('../middleware/auth');

// mergeParams: true → permet d'accéder à req.params.id du router parent (catways)
const router = express.Router({ mergeParams: true });

router.use(protect);

// =============================================================================
// GET /catways/:id/reservations — Toutes les réservations d'un catway
// =============================================================================

/**
 * @swagger
 * /catways/{id}/reservations:
 *   get:
 *     summary: Liste toutes les réservations d'un catway
 *     tags: [Réservations]
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
 *         description: Liste des réservations
 */
router.get('/', async (req, res) => {
  try {
    const reservations = await Reservation.find({
      catwayNumber: req.params.id,
    }).sort({ startDate: -1 }); // Triées par date décroissante (plus récente en premier)

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// GET /catways/:id/reservations/:idReservation — Détail d'une réservation
// =============================================================================

/**
 * @swagger
 * /catways/{id}/reservations/{idReservation}:
 *   get:
 *     summary: Récupère les détails d'une réservation
 *     tags: [Réservations]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: idReservation
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de la réservation
 *       404:
 *         description: Réservation non trouvée
 */
router.get('/:idReservation', async (req, res) => {
  try {
    const reservation = await Reservation.findOne({
      _id: req.params.idReservation,
      catwayNumber: req.params.id,
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation introuvable.',
      });
    }

    res.status(200).json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
