// ROUTES UTILISATEURS — CRUD complet
//
// GET    /users/           → Liste tous les utilisateurs
// GET    /users/:email     → Détail d'un utilisateur
// POST   /users/           → Créer un utilisateur
// PUT    /users/:email     → Modifier un utilisateur
// DELETE /users/:email     → Supprimer un utilisateur
// =============================================================================

const express     = require('express');
const User        = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// =============================================================================
// GET /users/ — Lister tous les utilisateurs
// =============================================================================

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Liste tous les utilisateurs
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs (sans mots de passe)
 */
router.get('/', async (req, res) => {
  try {
    // Le mot de passe n'est jamais renvoyé (select: false dans le modèle)
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});