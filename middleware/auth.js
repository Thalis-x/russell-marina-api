// MIDDLEWARE D'AUTHENTIFICATION JWT

// Ce middleware protège les routes privées de l'API.
// Fonctionnement :
//   1. Il cherche le token JWT dans le cookie "token" (pour les pages web)
//      OU dans le header "Authorization: Bearer <token>" (pour les appels API)
//   2. Il vérifie la validité du token avec la clé secrète
//   3. Si valide → il attache l'utilisateur décodé à req.user et appelle next()
//   4. Si invalide/absent → il renvoie une erreur 401 ou redirige vers /

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// protect : protège les routes API (renvoie du JSON)
const protect = async (req, res, next) => {
  try {
    let token;

    // 1. Chercher le token dans le cookie (navigation web)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // 2. Ou dans le header Authorization (clients API comme Postman)
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer ')
    ) {
      token = req.headers.authorization.split(' ')[1];
      // [1] fait réference au deuxiéme élément du tableau crée par split('') soit le token JWT sans Bearer
    }

    // Pas de token → non autorisé
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Accès non autorisé. Veuillez vous connecter.',
      });
    }

    // Vérifier et décoder le token
    // jwt.verify() lève une exception si le token est invalide ou expiré
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Récupérer l'utilisateur en base (sans le mot de passe)
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur introuvable.',
      });
    }

    next(); // Tout est OK → on passe à la route suivante
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré.',
    });
  }
};

// protectWeb : protège les routes WEB (redirige vers / si non connecté)
const protectWeb = async (req, res, next) => {
  try {
    const token = req.cookies && req.cookies.token;

    if (!token) {
      return res.redirect('/');
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.redirect('/');
    }

    next();
  } catch (error) {
    return res.redirect('/');
  }
};

module.exports = { protect, protectWeb };