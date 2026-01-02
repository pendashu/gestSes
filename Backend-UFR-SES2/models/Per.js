const mongoose = require('mongoose');

const perSchema = new mongoose.Schema({
  demandeur: String,
  service: String,
  objet: String,
  quantite: Number,
  typeBesoin: String,
  motif: String,
  montant: Number,
  date: String,
  statut: { type: String, default: 'en attente' }
});

module.exports = mongoose.model('Per', perSchema);