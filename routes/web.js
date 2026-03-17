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

// =============================================================================
// CATWAYS — Pages web
// =============================================================================

// Liste des catways
router.get('/catways', async (req, res) => {
  try {
    const catways = await Catway.find().sort({ catwayNumber: 1 });
    res.render('catways', { catways, message: req.query.msg, error: req.query.err });
  } catch (error) {
    res.redirect('/dashboard?err=' + encodeURIComponent(error.message));
  }
});

// Créer un catway (formulaire POST)
// Créer un catway (formulaire POST)
router.post('/catways', async (req, res) => {
  try {
    const { catwayNumber, catwayType, catwayState, isAvailable } = req.body;
    await Catway.create({
      catwayNumber,
      catwayType,
      catwayState,
      isAvailable: isAvailable === 'true',
    });
    res.redirect('/dashboard/catways?msg=Catway créé avec succès');
  } catch (error) {
    const msg = error.code === 11000
      ? `Le numéro ${req.body.catwayNumber} existe déjà`
      : error.message;
    res.redirect('/dashboard/catways?err=' + encodeURIComponent(msg));
  }
});

// Modifier un catway (POST avec suffixe /edit)
router.post('/catways/:id/edit', async (req, res) => {
  try {
    const { catwayState } = req.body;
    await Catway.findOneAndUpdate(
      { catwayNumber: req.params.id },
      { catwayState },
      { runValidators: true }
    );
    res.redirect('/dashboard/catways?msg=Catway mis à jour');
  } catch (error) {
    res.redirect('/dashboard/catways?err=' + encodeURIComponent(error.message));
  }
});

// Supprimer un catway (POST avec suffixe /delete)
router.post('/catways/:id/delete', async (req, res) => {
  try {
    await Catway.findOneAndDelete({ catwayNumber: req.params.id });
    await Reservation.deleteMany({ catwayNumber: req.params.id });
    res.redirect('/dashboard/catways?msg=Catway supprimé');
  } catch (error) {
    res.redirect('/dashboard/catways?err=' + encodeURIComponent(error.message));
  }
});