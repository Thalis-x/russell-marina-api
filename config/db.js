// CONNEXION À MONGODB
// Ce module gère la connexion à la base de données MongoDB via Mongoose.
// Il est appelé une seule fois au démarrage du serveur.

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // mongoose.connect() retourne une Promise — on attend la connexion
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connecté : " + conn.connection.host);
  } catch (error) {
    console.error("Erreur de connexion MongoDB : " + error.message);
    // On quitte le processus si la DB est inaccessible (code 1 = erreur)
    process.exit(1);
  }
};

module.exports = connectDB;