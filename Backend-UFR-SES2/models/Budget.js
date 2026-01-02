const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
  motif: { type: String, required: true },
  montant: { type: Number, required: true },
  date: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['depense', 'budget_initial'], 
    default: 'depense' 
  }
});

module.exports = mongoose.model('Budget', budgetSchema);