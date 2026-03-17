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

// =============================================================================
// POST /catways/:id/reservations — Créer une réservation
// =============================================================================

/**
 * @swagger
 * /catways/{id}/reservations:
 *   post:
 *     summary: Crée une nouvelle réservation pour un catway
 *     tags: [Réservations]
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
 *             required: [clientName, boatName, startDate, endDate]
 *             properties:
 *               clientName:
 *                 type: string
 *               boatName:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Réservation créée
 *       400:
 *         description: Données invalides ou conflit de dates
 *       404:
 *         description: Catway non trouvé
 */
router.post('/', async (req, res) => {
  try {
    const catwayNumber = Number(req.params.id);

    // Vérifier que le catway existe
    const catway = await Catway.findOne({ catwayNumber });
    if (!catway) {
      return res.status(404).json({
        success: false,
        message: `Catway numéro ${catwayNumber} introuvable.`,
      });
    }
    if (!catway.isAvailable) {
  return res.status(400).json({
    success: false,
    message: `Le catway ${catwayNumber} n'est pas disponible : ${catway.catwayState}`,
  });
}

    const { clientName, boatName, startDate, endDate } = req.body;
    const start = new Date(startDate);
    const end   = new Date(endDate);

    // Vérifier les chevauchements de réservations
    // On cherche si une réservation existe qui chevauche la période demandée
    const overlap = await Reservation.findOne({
      catwayNumber,
      $or: [
        { startDate: { $lt: end }, endDate: { $gt: start } },
      ],
    });

    if (overlap) {
      return res.status(400).json({
        success: false,
        message: `Le catway ${catwayNumber} est déjà réservé sur cette période.`,
        conflictWith: {
          client: overlap.clientName,
          from: overlap.startDate,
          to: overlap.endDate,
        },
      });
    }

    const reservation = await Reservation.create({
      catwayNumber,
      clientName,
      boatName,
      startDate: start,
      endDate: end,
    });

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès.',
      data: reservation,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});