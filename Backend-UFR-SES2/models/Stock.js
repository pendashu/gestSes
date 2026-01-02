const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  seuil: { type: Number, default: 5 },
  entrees: { type: Number, default: 0 },
  sorties: { type: Number, default: 0 }
});

stockSchema.virtual('stockActuel').get(function() {
  return this.entrees - this.sorties;
});

stockSchema.set('toJSON', { virtuals: true });
stockSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Stock', stockSchema);