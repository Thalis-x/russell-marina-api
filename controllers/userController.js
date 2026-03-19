// CONTRÔLEUR UTILISATEURS
// Contient toute la logique métier pour les opérations CRUD des utilisateurs.
// Le mot de passe n'est jamais renvoyé dans les réponses (select: false).
// =============================================================================

const User   = require('../models/User');
const bcrypt = require('bcryptjs');

// -----------------------------------------------------------------------------
// GET /users — Lister tous les utilisateurs
// Le mot de passe est exclu automatiquement (select: false dans le modèle)
// -----------------------------------------------------------------------------
exports.getAll = async (req, res) => {
  try {
    // Triés par date de création décroissante (plus récent en premier)
    const users = await User.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------------------
// GET /users/:email — Détail d'un utilisateur
// Recherche par email (converti en minuscules pour éviter les doublons)
// -----------------------------------------------------------------------------
exports.getOne = async (req, res) => {
  try {
    // On convertit l'email en minuscules pour la recherche
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
};

// -----------------------------------------------------------------------------
// POST /users — Créer un utilisateur
// Le mot de passe est haché automatiquement par le middleware pre('save')
// -----------------------------------------------------------------------------
exports.create = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = await User.create({ username, email, password });

    // On ne renvoie jamais le mot de passe dans la réponse
    const userResponse = {
      _id:       user._id,
      username:  user.username,
      email:     user.email,
      createdAt: user.createdAt,
    };

    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès.',
      data: userResponse,
    });
  } catch (error) {
    // Code 11000 = email déjà utilisé (contrainte d'unicité MongoDB)
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Cette adresse email est déjà utilisée.',
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------------------
// PUT /users/:email — Modifier un utilisateur
// Si un nouveau mot de passe est fourni, il est haché manuellement
// car findOneAndUpdate ne déclenche pas le middleware pre('save')
// -----------------------------------------------------------------------------
exports.update = async (req, res) => {
  try {
    const { username, email: newEmail, password } = req.body;
    const updateData = {};

    // On n'ajoute que les champs fournis dans la requête
    if (username) updateData.username = username;
    if (newEmail) updateData.email    = newEmail.toLowerCase();

    // Si un nouveau mot de passe est fourni, on le hache manuellement
    // findOneAndUpdate ne déclenche pas le pre('save') du modèle
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const user = await User.findOneAndUpdate(
      { email: req.params.email.toLowerCase() },
      updateData,
      { new: true, runValidators: true } // new: true → retourne le document mis à jour
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
    // Code 11000 = email déjà utilisé par un autre compte
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Cette adresse email est déjà utilisée.',
      });
    }
    res.status(400).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------------------
// DELETE /users/:email — Supprimer un utilisateur
// Un utilisateur ne peut pas supprimer son propre compte
// -----------------------------------------------------------------------------
exports.remove = async (req, res) => {
  try {
    // Sécurité : empêcher un utilisateur de se supprimer lui-même
    if (req.user.email === req.params.email.toLowerCase()) {
      return res.status(400).json({
        success: false,
        message: 'Vous ne pouvez pas supprimer votre propre compte.',
      });
    }

    const user = await User.findOneAndDelete({
      email: req.params.email.toLowerCase(),
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: `Utilisateur "${req.params.email}" introuvable.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Utilisateur "${req.params.email}" supprimé avec succès.`,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};