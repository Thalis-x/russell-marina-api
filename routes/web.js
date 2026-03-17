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

// =============================================================================
// RÉSERVATIONS — Pages web (sous-ressource d'un catway)
// =============================================================================

// Liste des réservations d'un catway
router.get('/catways/:id/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find({
      catwayNumber: req.params.id,
    }).sort({ startDate: -1 });

    res.render('reservations', {
      catwayNumber: req.params.id,
      reservations,
      message: req.query.msg,
      error:   req.query.err,
    });
  } catch (error) {
    res.redirect('/dashboard/catways?err=' + encodeURIComponent(error.message));
  }
});

// Créer une réservation
router.post('/catways/:id/reservations', async (req, res) => {
  try {
    const catwayNumber = Number(req.params.id);
    const catway = await Catway.findOne({ catwayNumber });
    if (catway && !catway.isAvailable) {
      const msg = `Le catway ${catwayNumber} n'est pas disponible : ${catway.catwayState}`;
      return res.redirect(
        `/dashboard/catways/${catwayNumber}/reservations?err=${encodeURIComponent(msg)}`
      );
    }

    const { clientName, boatName, startDate, endDate } = req.body;
    const start = new Date(startDate);
    const end   = new Date(endDate);

    // Vérifier chevauchement
    const overlap = await Reservation.findOne({
      catwayNumber,
      startDate: { $lt: end },
      endDate:   { $gt: start },
    });

    if (overlap) {
      const msg = `Conflit avec la réservation de ${overlap.clientName}`;
      return res.redirect(
        `/dashboard/catways/${catwayNumber}/reservations?err=${encodeURIComponent(msg)}`
      );
    }

    await Reservation.create({ catwayNumber, clientName, boatName, startDate: start, endDate: end });
    res.redirect(`/dashboard/catways/${catwayNumber}/reservations?msg=Réservation créée`);
  } catch (error) {
    res.redirect(
      `/dashboard/catways/${req.params.id}/reservations?err=${encodeURIComponent(error.message)}`
    );
  }
});

// Modifier une réservation
router.post('/catways/:id/reservations/:resId/edit', async (req, res) => {
  try {
    const { clientName, boatName, startDate, endDate } = req.body;
    await Reservation.findByIdAndUpdate(
      req.params.resId,
      { clientName, boatName, startDate: new Date(startDate), endDate: new Date(endDate) },
      { runValidators: true }
    );
    res.redirect(`/dashboard/catways/${req.params.id}/reservations?msg=Réservation mise à jour`);
  } catch (error) {
    res.redirect(
      `/dashboard/catways/${req.params.id}/reservations?err=${encodeURIComponent(error.message)}`
    );
  }
});

// Supprimer une réservation
router.post('/catways/:id/reservations/:resId/delete', async (req, res) => {
  try {
    await Reservation.findByIdAndDelete(req.params.resId);
    res.redirect(`/dashboard/catways/${req.params.id}/reservations?msg=Réservation supprimée`);
  } catch (error) {
    res.redirect(
      `/dashboard/catways/${req.params.id}/reservations?err=${encodeURIComponent(error.message)}`
    );
  }
});

// =============================================================================
// UTILISATEURS — Pages web
// =============================================================================

// Liste des utilisateurs
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.render('users', {
      users,
      currentUser: req.user,
      message: req.query.msg,
      error:   req.query.err,
    });
  } catch (error) {
    res.redirect('/dashboard?err=' + encodeURIComponent(error.message));
  }
});

// Créer un utilisateur
router.post('/users', async (req, res) => {
  try {
    await User.create(req.body);
    res.redirect('/dashboard/users?msg=Utilisateur créé avec succès');
  } catch (error) {
    const msg = error.code === 11000 ? 'Email déjà utilisé' : error.message;
    res.redirect('/dashboard/users?err=' + encodeURIComponent(msg));
  }
});

// Modifier un utilisateur
router.post('/users/:email/edit', async (req, res) => {
  try {
    const { username, password } = req.body;
    const updateData = {};
    if (username) updateData.username = username;
    if (password) {
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(password, 12);
    }
    await User.findOneAndUpdate(
      { email: req.params.email },
      updateData,
      { runValidators: true }
    );
    res.redirect('/dashboard/users?msg=Utilisateur mis à jour');
  } catch (error) {
    res.redirect('/dashboard/users?err=' + encodeURIComponent(error.message));
  }
});

// Supprimer un utilisateur
router.post('/users/:email/delete', async (req, res) => {
  try {
    if (req.user.email === decodeURIComponent(req.params.email)) {
      return res.redirect('/dashboard/users?err=Impossible de supprimer votre propre compte');
    }
    await User.findOneAndDelete({ email: decodeURIComponent(req.params.email) });
    res.redirect('/dashboard/users?msg=Utilisateur supprimé');
  } catch (error) {
    res.redirect('/dashboard/users?err=' + encodeURIComponent(error.message));
  }
});

// Liste globale de toutes les réservations
router.get('/reservations', async (req, res) => {
  try {
    const reservations = await Reservation.find().sort({ startDate: -1 });
    res.render('all-reservations', {
      reservations,
      message: req.query.msg,
      error:   req.query.err,
    });
  } catch (error) {
    res.redirect('/dashboard?err=' + encodeURIComponent(error.message));
  }
});


module.exports = router;
