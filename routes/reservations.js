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