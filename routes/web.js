// ROUTES WEB — Pages HTML du tableau de bord
//
// Ces routes servent les pages EJS et gèrent les formulaires HTML.
// Les formulaires HTML ne supportent que GET et POST, donc pour les
// opérations DELETE et PUT on utilise POST avec un suffixe d'action :
//   POST /dashboard/catways/:id/edit   → mise à jour
//   POST /dashboard/catways/:id/delete → suppression
// =============================================================================

const express      = require('express');
const Catway       = require('../models/Catway');
const Reservation  = require('../models/Reservation');
const User         = require('../models/User');
const { protectWeb } = require('../middleware/auth');

const router = express.Router();

// Toutes les routes /dashboard/* nécessitent d'être connecté
router.use(protectWeb);

// =============================================================================
// GET /dashboard — Tableau de bord principal
// =============================================================================
router.get('/', async (req, res) => {
  try {
    const today = new Date();

    // Réservations actives = celles dont la date de début est passée
    // ET la date de fin n'est pas encore atteinte
    const activeReservations = await Reservation.find({
      startDate: { $lte: today },
      endDate:   { $gte: today },
    }).sort({ endDate: 1 });

    const totalCatways = await Catway.countDocuments();
    const totalUsers   = await User.countDocuments();

    res.render('dashboard', {
      user: req.user,
      activeReservations,
      totalCatways,
      totalUsers,
    });
  } catch (error) {
    res.status(500).send('Erreur serveur : ' + error.message);
  }
});
