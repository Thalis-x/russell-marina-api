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

// =============================================================================
// GET /users/:email — Détail d'un utilisateur
// =============================================================================

/**
 * @swagger
 * /users/{email}:
 *   get:
 *     summary: Récupère les détails d'un utilisateur par email
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Détails de l'utilisateur
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get('/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Utilisateur "${req.params.email}" introuvable.`,
      });
    }

    res.status(200).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// =============================================================================
// POST /users/ — Créer un utilisateur
// =============================================================================

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Crée un nouvel utilisateur
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       201:
 *         description: Utilisateur créé
 *       400:
 *         description: Données invalides ou email déjà utilisé
 */
router.post('/', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const user = await User.create({ username, email, password });

    // Ne pas renvoyer le mot de passe dans la réponse
    const userResponse = {
      _id: user._id,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès.',
      data: userResponse,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Cette adresse email est déjà utilisée.',
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});

// =============================================================================
// PUT /users/:email — Modifier un utilisateur
// =============================================================================

/**
 * @swagger
 * /users/{email}:
 *   put:
 *     summary: Modifie les informations d'un utilisateur
 *     tags: [Utilisateurs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 *       404:
 *         description: Utilisateur non trouvé
 */
router.put('/:email', async (req, res) => {
  try {
    const { username, email: newEmail, password } = req.body;
    const updateData = {};

    if (username)  updateData.username = username;
    if (newEmail)  updateData.email    = newEmail.toLowerCase();

    // Si un nouveau mot de passe est fourni, on le hache manuellement
    // (findOneAndUpdate ne déclenche pas le pre('save') du modèle)
    if (password) {
      const bcrypt = require('bcryptjs');
      updateData.password = await bcrypt.hash(password, 12);
    }

    const user = await User.findOneAndUpdate(
      { email: req.params.email.toLowerCase() },
      updateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Utilisateur "${req.params.email}" introuvable.`,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Utilisateur mis à jour.',
      data: user,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Cette adresse email est déjà utilisée.',
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
});