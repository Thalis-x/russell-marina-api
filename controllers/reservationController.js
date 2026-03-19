// CONTRÔLEUR RÉSERVATIONS
// Contient toute la logique métier pour les opérations CRUD des réservations.
// Les réservations sont une sous-ressource des catways (/catways/:id/reservations)
// =============================================================================

const Reservation = require('../models/Reservation');
const Catway      = require('../models/Catway');

// -----------------------------------------------------------------------------
// GET /catways/:id/reservations — Lister toutes les réservations d'un catway
// Triées par date décroissante (plus récente en premier)
// -----------------------------------------------------------------------------
exports.getAll = async (req, res) => {
  try {
    const reservations = await Reservation.find({
      catwayNumber: req.params.id,
    }).sort({ startDate: -1 }); // -1 = ordre décroissant

    res.status(200).json({
      success: true,
      count: reservations.length,
      data: reservations,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------------------
// GET /catways/:id/reservations/:idReservation — Détail d'une réservation
// Vérifie que la réservation appartient bien au catway demandé
// -----------------------------------------------------------------------------
exports.getOne = async (req, res) => {
  try {
    // On filtre par _id ET catwayNumber pour sécuriser la requête
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
};

// -----------------------------------------------------------------------------
// POST /catways/:id/reservations — Créer une réservation
// Vérifie que le catway existe et qu'il n'y a pas de chevauchement de dates
// -----------------------------------------------------------------------------
exports.create = async (req, res) => {
  try {
    const catwayNumber = Number(req.params.id);

    // Vérifier que le catway existe avant de créer la réservation
    const catway = await Catway.findOne({ catwayNumber });
    if (!catway) {
      return res.status(404).json({
        success: false,
        message: `Catway numéro ${catwayNumber} introuvable.`,
      });
    }

    const { clientName, boatName, startDate, endDate } = req.body;
    const start = new Date(startDate);
    const end   = new Date(endDate);

    // Vérifier les chevauchements de réservations sur ce catway
    // On cherche une réservation dont la période chevauche la nouvelle
    const overlap = await Reservation.findOne({
      catwayNumber,
      startDate: { $lt: end },  // commence avant la fin de la nouvelle
      endDate:   { $gt: start }, // finit après le début de la nouvelle
    });

    if (overlap) {
      return res.status(400).json({
        success: false,
        message: `Le catway ${catwayNumber} est déjà réservé sur cette période.`,
        conflictWith: {
          client: overlap.clientName,
          from:   overlap.startDate,
          to:     overlap.endDate,
        },
      });
    }

    const reservation = await Reservation.create({
      catwayNumber,
      clientName,
      boatName,
      startDate: start,
      endDate:   end,
    });

    res.status(201).json({
      success: true,
      message: 'Réservation créée avec succès.',
      data: reservation,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------------------
// PUT /catways/:id/reservations/:idReservation — Modifier une réservation
// Vérifie le chevauchement en excluant la réservation actuelle
// -----------------------------------------------------------------------------
exports.update = async (req, res) => {
  try {
    // On exclut catwayNumber du body pour ne pas pouvoir le modifier
    const { catwayNumber: _, ...updateData } = req.body;
    const { startDate, endDate } = updateData;

    // Vérifier le chevauchement uniquement si les dates sont modifiées
    if (startDate || endDate) {
      // Récupérer la réservation actuelle pour avoir les dates existantes
      const current = await Reservation.findById(req.params.idReservation);

      const start = new Date(startDate || current.startDate);
      const end   = new Date(endDate   || current.endDate);

      // Chercher un chevauchement en excluant la réservation en cours de modification
      const overlap = await Reservation.findOne({
        _id:          { $ne: req.params.idReservation }, // $ne = not equal (différent de)
        catwayNumber: req.params.id,
        startDate:    { $lt: end },
        endDate:      { $gt: start },
      });

      if (overlap) {
        return res.status(400).json({
          success: false,
          message: `Conflit avec la réservation de ${overlap.clientName} du ${new Date(overlap.startDate).toLocaleDateString('fr-FR')} au ${new Date(overlap.endDate).toLocaleDateString('fr-FR')}`,
        });
      }

      updateData.startDate = start;
      updateData.endDate   = end;
    }

    const reservation = await Reservation.findOneAndUpdate(
      { _id: req.params.idReservation, catwayNumber: req.params.id },
      updateData,
      { new: true, runValidators: false } // runValidators: false car la validation des dates pose problème lors d'un update
    );

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation introuvable.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Réservation mise à jour.',
      data: reservation,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------------------
// DELETE /catways/:id/reservations/:idReservation — Supprimer une réservation
// Vérifie que la réservation appartient bien au catway demandé
// -----------------------------------------------------------------------------
exports.remove = async (req, res) => {
  try {
    // On filtre par _id ET catwayNumber pour sécuriser la suppression
    const reservation = await Reservation.findOneAndDelete({
      _id:          req.params.idReservation,
      catwayNumber: req.params.id,
    });

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: 'Réservation introuvable.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Réservation supprimée avec succès.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};