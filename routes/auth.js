// ROUTES D'AUTHENTIFICATION

// POST /login  → Connexion : vérifie email+mdp, crée un cookie JWT
// GET  /logout → Déconnexion : supprime le cookie JWT

const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');

const router = express.Router();