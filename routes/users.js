// ROUTES UTILISATEURS — CRUD complet

// GET    /users/           → Liste tous les utilisateurs
// GET    /users/:email     → Détail d'un utilisateur
// POST   /users/           → Créer un utilisateur
// PUT    /users/:email     → Modifier un utilisateur
// DELETE /users/:email     → Supprimer un utilisateur

// Toutes les routes sont protégées par le middleware JWT "protect".

const express          = require('express');
const userController   = require('../controllers/userController');
const { protect }      = require('../middleware/auth');

const router = express.Router();

// Applique le middleware d'authentification sur TOUTES les routes
router.use(protect);

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
router.get('/', userController.getAll);

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
router.get('/:email', userController.getOne);

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
router.post('/', userController.create);

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
router.put('/:email', userController.update);

/**
 * @swagger
 * /users/{email}:
 *   delete:
 *     summary: Supprime un utilisateur
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
 *         description: Utilisateur supprimé
 *       400:
 *         description: Impossible de se supprimer soi-même
 *       404:
 *         description: Utilisateur non trouvé
 */
router.delete('/:email', userController.remove);

module.exports = router;