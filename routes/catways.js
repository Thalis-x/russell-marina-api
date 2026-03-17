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
