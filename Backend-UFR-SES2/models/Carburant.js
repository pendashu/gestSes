const mongoose = require('mongoose');

const carburantSchema = new mongoose.Schema({
  semaine: String,
  vehicule: String,
  conducteur: String,
  kilometrage: Number,
  quantite: Number,
  cout: Number,
  statut: String
});

module.exports = mongoose.model('Carburant', carburantSchema);

module.exports = mongoose.model('Carburant', carburantSchema);