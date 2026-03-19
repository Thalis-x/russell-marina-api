// ROUTES RÉSERVATIONS — Sous-ressource de Catway
// Les réservations sont liées à un catway spécifique.
// L'URL reflète cette relation : /catways/:id/reservations
// =============================================================================

const express                 = require('express');
const reservationController   = require('../controllers/reservationController');
const { protect }             = require('../middleware/auth');

// mergeParams: true → permet d'accéder à req.params.id du router parent (catways)
const router = express.Router({ mergeParams: true });

router.use(protect);

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
router.get('/', reservationController.getAll);

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
router.get('/:idReservation', reservationController.getOne);

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
router.post('/', reservationController.create);

/**
 * @swagger
 * /catways/{id}/reservations/{idReservation}:
 *   put:
 *     summary: Modifie une réservation
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
 *         description: Réservation mise à jour
 *       404:
 *         description: Réservation non trouvée
 */
router.put('/:idReservation', reservationController.update);

/**
 * @swagger
 * /catways/{id}/reservations/{idReservation}:
 *   delete:
 *     summary: Supprime une réservation
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
 *         description: Réservation supprimée
 *       404:
 *         description: Réservation non trouvée
 */
router.delete('/:idReservation', reservationController.remove);

module.exports = router;