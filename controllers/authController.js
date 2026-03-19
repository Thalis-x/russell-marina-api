// CONTRÔLEUR AUTHENTIFICATION
// Contient la logique métier pour le login et le logout.
// =============================================================================

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// -----------------------------------------------------------------------------
// POST /login — Connexion
// -----------------------------------------------------------------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis.',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Email ou mot de passe incorrect.',
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 24 * 60 * 60 * 1000,
    });

    if (req.headers['content-type'] === 'application/json') {
      return res.status(200).json({
        success: true,
        message: 'Connexion réussie.',
        token,
        user: { id: user._id, username: user.username, email: user.email },
      });
    }

    res.redirect('/dashboard');
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// -----------------------------------------------------------------------------
// GET /logout — Déconnexion
// -----------------------------------------------------------------------------
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.redirect('/');
};