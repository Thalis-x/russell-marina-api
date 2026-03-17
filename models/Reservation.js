// MODÈLE RÉSERVATION
// Une réservation lie un catway à un client pour une période donnée.
// La validation s'assure que la date de fin est bien après la date de début,
// et qu'il n'y a pas de chevauchement avec une réservation existante
// (logique métier gérée dans le contrôleur/route).

const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema(
  {
    catwayNumber: {
      type: Number,
      required: [true, 'Le numéro de catway est obligatoire'],
      min: [1, 'Le numéro doit être supérieur à 0'],
    },

    clientName: {
      type: String,
      required: [true, 'Le nom du client est obligatoire'],
      trim: true,
      minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
      maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères'],
    },

    boatName: {
      type: String,
      required: [true, 'Le nom du bateau est obligatoire'],
      trim: true,
      minlength: [1, 'Le nom du bateau doit contenir au moins 1 caractère'],
      maxlength: [100, 'Le nom du bateau ne peut pas dépasser 100 caractères'],
    },

    startDate: {
      type: Date,
      required: [true, 'La date de début est obligatoire'],
    },

    endDate: {
      type: Date,
      required: [true, 'La date de fin est obligatoire'],
      // Validation : la date de fin doit être après la date de début
      validate: {
        validator: function (value) {
          return value > this.startDate;
        },
        message: 'La date de fin doit être postérieure à la date de début',
      },
    },
  },
  {
    timestamps: true,
  }
);

// -----------------------------------------------------------------------------
// INDEX COMPOSÉ : améliore les performances des requêtes filtrées par catway
// et par plage de dates (ex: "réservations actives du catway 3")
// -----------------------------------------------------------------------------
reservationSchema.index({ catwayNumber: 1, startDate: 1, endDate: 1 });

module.exports = mongoose.model('Reservation', reservationSchema);