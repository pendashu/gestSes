const express = require('express');
const router = express.Router();
const Per = require('../models/Per');
const Budget = require('../models/Budget');
const Stock = require('../models/Stock');
const Carburant = require('../models/Carburant');

router.get('/', async (req, res) => {
  try {
    // 💰 Budget initial
const budgetsInitiaux = await Budget.find({ type: 'budget_initial' });
const totalBudget = budgetsInitiaux.length > 0 
  ? budgetsInitiaux.reduce((sum, b) => sum + b.montant, 0)
  : 1500000; // ⚠️ Valeur par défaut si aucun budget initial enregistré
  
    // 💸 Dépenses
    const depenses = await Budget.find({ type: 'depense' });
    const totalDepenses = depenses.reduce((sum, d) => sum + d.montant, 0);

    const solde = totalBudget - totalDepenses;

    // 📋 PER en attente
    const perEnAttente = await Per.countDocuments({ statut: 'en attente' });

    // 📦 Stocks critiques (quantité ≤ seuil)
    const stocksCritiques = await Stock.countDocuments({ 
      $expr: { $lte: ["$quantite", "$seuil"] } 
    });

    // ⛽ Consommation moyenne
    const consommations = await Carburant.find();
    const consommationMoyenne = consommations.length 
      ? (consommations.reduce((sum, c) => sum + c.quantite, 0) / consommations.length).toFixed(1)
      : 0;

    res.json({
      resume: {
        totalBudget,
        totalDepenses,
        solde,
        perEnAttente,
        stocksCritiques,
        consommationMoyenne: parseFloat(consommationMoyenne)
      }
    });
  } catch (err) {
    console.error("Erreur dashboard :", err);
    res.status(500).json({ error: "Erreur serveur" });
  }
});

module.exports = router;