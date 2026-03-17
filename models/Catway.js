// MODÈLE CATWAY
// Un catway est un petit appontement (passerelle flottante) pour amarrer un bateau.
// Chaque catway a un numéro unique, un type (long/short) et un état décrivant sa condition physique.

const mongoose = require('mongoose');

const catwaySchema = new mongoose.Schema(
  {
    catwayNumber: {
      type: Number,
      required: [true, 'Le numéro de catway est obligatoire'],
      unique: true, // Chaque numéro est unique
      min: [1, 'Le numéro doit être supérieur à 0'],
    },

    catwayType: {
      type: String,
      required: [true, 'Le type de catway est obligatoire'],
      // enum limite les valeurs possibles à "long" ou "short" et protége donc au niveau de l'API l'ajout d'autres choix
      enum: {
        values: ['long', 'short'],
        message: 'Le type doit être "long" ou "short"',
      },
    },

    catwayState: {
      type: String,
      required: [true, 'L\'état du catway est obligatoire'],
      trim: true, //Supprime automatiquement les espaces inutiles
      maxlength: [200, 'La description de l\'état ne peut pas dépasser 200 caractères'],
      default: 'bon état',
    },

    // Disponibilité à la réservation (false = en réparation ou hors service)
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, 
    //option Mongoose qui ajoute automatiquement 2 champs à chaque document 
    //(pratique pour savoir quand un catway a été créé ou modifié)
  }
);

module.exports = mongoose.model('Catway', catwaySchema);