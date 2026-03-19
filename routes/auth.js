// ROUTES D'AUTHENTIFICATION
// POST /login  → Connexion
// GET  /logout → Déconnexion
// =============================================================================

const express        = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

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
router.post('/login', authController.login);

/**
 * @swagger
 * /logout:
 *   get:
 *     summary: Déconnexion utilisateur
 *     tags: [Authentification]
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
router.get('/logout', authController.logout);

module.exports = router;