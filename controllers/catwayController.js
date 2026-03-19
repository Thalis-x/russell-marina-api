// controllers/catwayController.js
// =============================================================================
// CONTRÔLEUR CATWAYS
// Contient toute la logique métier pour les opérations CRUD des catways.
// La logique est séparée des routes pour une meilleure organisation du code.
// =============================================================================

const Catway      = require('../models/Catway');
const Reservation = require('../models/Reservation');

// -----------------------------------------------------------------------------
// GET /catways — Lister tous les catways
// Récupère tous les catways triés par numéro croissant
// -----------------------------------------------------------------------------
exports.getAll = async (req, res) => {
  try {
    // .sort({ catwayNumber: 1 }) → triés par numéro croissant
    const catways = await Catway.find().sort({ catwayNumber: 1 });
    res.status(200).json({
      success: true,
      count: catways.length, // nombre total de catways
      data: catways,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------------------
// GET /catways/:id — Détail d'un catway
// Recherche par catwayNumber (pas par _id MongoDB)
// -----------------------------------------------------------------------------
exports.getOne = async (req, res) => {
  try {
    // On cherche par catwayNumber et non par _id MongoDB
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
};

// -----------------------------------------------------------------------------
// POST /catways — Créer un catway
// Gestion de l'erreur d'unicité MongoDB (code 11000) si le numéro existe déjà
// -----------------------------------------------------------------------------
exports.create = async (req, res) => {
  try {
    const catway = await Catway.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Catway créé avec succès.',
      data: catway,
    });
  } catch (error) {
    // Code 11000 = erreur d'unicité MongoDB (catwayNumber déjà existant)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: `Le numéro de catway ${req.body.catwayNumber} existe déjà.`,
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------------------
// PUT /catways/:id — Modifier l'état d'un catway
// IMPORTANT : seul catwayState est modifiable
// catwayNumber et catwayType ne peuvent pas être modifiés
// -----------------------------------------------------------------------------
exports.update = async (req, res) => {
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
      { new: true, runValidators: true } // new: true → retourne le document mis à jour
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
};

// -----------------------------------------------------------------------------
// DELETE /catways/:id — Supprimer un catway
// Supprime également toutes les réservations liées à ce catway
// -----------------------------------------------------------------------------
exports.remove = async (req, res) => {
  try {
    const catway = await Catway.findOneAndDelete({ catwayNumber: req.params.id });

    if (!catway) {
      return res.status(404).json({
        success: false,
        message: `Catway numéro ${req.params.id} introuvable.`,
      });
    }

    // Suppression en cascade des réservations liées à ce catway
    await Reservation.deleteMany({ catwayNumber: req.params.id });

    res.status(200).json({
      success: true,
      message: `Catway numéro ${req.params.id} supprimé avec succès.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};