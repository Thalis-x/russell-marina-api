// SCRIPT D'INITIALISATION DE LA BASE DE DONNÉES
//
// Ce script insère dans MongoDB :
//   - Les 24 catways depuis catways.json
//   - Les 6 réservations depuis reservations.json
//   - 1 utilisateur administrateur par défaut
//
// USAGE : node seed.js
// Ce script SUPPRIME et RECRÉE les données existantes.
// =============================================================================

require('dotenv').config();
const mongoose    = require('mongoose');
const Catway      = require('./models/Catway');
const Reservation = require('./models/Reservation');
const User        = require('./models/User');
const catways     = require('./data/catways.json');
const reservations = require('./data/reservations.json');

const seed = async () => {
  try {
    console.log('Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connecté\n');

    // --- Catways ---
    console.log('Suppression des catways existants...');
    await Catway.deleteMany({});
    console.log('Insertion des catways...');
    const insertedCatways = await Catway.insertMany(catways);
    console.log(`${insertedCatways.length} catways insérés\n`);

    // --- Réservations ---
    console.log('Suppression des réservations existantes...');
    await Reservation.deleteMany({});
    console.log('Insertion des réservations...');
    const insertedRes = await Reservation.insertMany(reservations);
    console.log(`${insertedRes.length} réservations insérées\n`);

    // --- Utilisateur admin ---
    console.log('Création de l\'utilisateur administrateur...');
    await User.deleteMany({});
    await User.create({
      username: 'Capitaine',
      email:    'admin@russell.fr',
      password: 'admin123',
    });
    console.log('Utilisateur créé :');
    console.log('Email    : admin@russell.fr');
    console.log('Mot de passe : admin123');
    console.log('Changez ce mot de passe en production !\n');

    console.log('Base de données initialisée avec succès !');
    process.exit(0);
  } catch (error) {
    console.error('Erreur lors du seed :', error.message);
    process.exit(1);
  }
};

seed();
