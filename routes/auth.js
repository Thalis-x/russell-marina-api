// ROUTES D'AUTHENTIFICATION

// POST /login  → Connexion : vérifie email+mdp, crée un cookie JWT
// GET  /logout → Déconnexion : supprime le cookie JWT

const express = require('express');
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');

const router = express.Router();

// POST /login — Connexion

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       401:
 *         description: Identifiants invalides
 */

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation des champs
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis.',
      });
    }

    // Chercher l'utilisateur en incluant le mot de passe (select: false par défaut)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect.',
      });
    }

    // Vérifier le mot de passe avec bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect.',
      });
    }

    // Créer le token JWT (contient l'id utilisateur, expire selon .env)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });

    // Stocker le token dans un cookie HTTP-only (inaccessible au JS du navigateur)
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS en prod
      maxAge: 24 * 60 * 60 * 1000, // 24 heures en ms
    });

    // Répondre selon le type de requête (API vs formulaire web)
    if (req.headers['content-type'] === 'application/json') {
      return res.status(200).json({
        success: true,
        message: 'Connexion réussie.',
        token,
        user: { id: user._id, username: user.username, email: user.email },
      });
    }

    // Redirection vers le tableau de bord (formulaire HTML)
    res.redirect('/dashboard');
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});