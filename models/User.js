// MODÈLE UTILISATEUR
// Définit la structure d'un utilisateur en base de données.
// Le mot de passe est automatiquement haché avant chaque sauvegarde
// grâce au middleware Mongoose "pre('save')".

const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Le nom d\'utilisateur est obligatoire'],
      trim: true,               // Supprime les espaces en début/fin
      minlength: [3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'],
      maxlength: [30, 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères'],
    },

    email: {
      type: String,
      required: [true, 'L\'adresse email est obligatoire'],
      unique: true,             // Unicité garantie au niveau de la DB
      lowercase: true,          // Stocké en minuscules pour éviter les doublons
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 
        //expression régulière (regex) qui vérifie que l'email a un format valide.
        'Veuillez fournir une adresse email valide',
      ],
    },

    password: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire'],
      minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
      // select: false → le mot de passe n'est jamais renvoyé dans les requêtes GET
      select: false,
    },
  },
  {
    // timestamps: true ajoute automatiquement createdAt et updatedAt
    timestamps: true,
  }
);

// -----------------------------------------------------------------------------
// MIDDLEWARE PRE-SAVE : Hachage du mot de passe
// Ce code s'exécute AVANT chaque save() si le mot de passe a été modifié.
// On utilise bcrypt avec un "salt" de 12 tours (bon compromis sécurité/perf).
// -----------------------------------------------------------------------------
userSchema.pre('save', async function (next) {
  // Si le mot de passe n'a pas été modifié, on passe au suivant
  if (!this.isModified('password')) return next();

  // Hachage du mot de passe
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// -----------------------------------------------------------------------------
// MÉTHODE D'INSTANCE : Vérifier le mot de passe
// comparePassword() est appelée lors du login pour vérifier le mdp entré.
// bcrypt.compare() compare le mot de passe en clair avec le hash stocké.
// -----------------------------------------------------------------------------
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
