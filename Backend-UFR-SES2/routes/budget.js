const express = require('express');
const router = express.Router();
const Budget = require('../models/Budget');

// GET /api/budget → liste des dépenses (type: 'depense')
router.get('/', async (req, res) => {
  try {
    const depenses = await Budget.find({ type: 'depense' });
    res.json(depenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/budget → ajouter une dépense
router.post('/', async (req, res) => {
  try {
    const nouvelleDepense = new Budget({
      ...req.body,
      type: 'depense'
    });
    await nouvelleDepense.save();
    res.status(201).json(nouvelleDepense);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// POST /api/budget/initial → enregistrer le budget initial
router.post('/initial', async (req, res) => {
  try {
    const budgetInitial = new Budget({
      motif: "Budget initial annuel",
      montant: req.body.montant,
      date: new Date().toISOString().split('T')[0],
      type: 'budget_initial'
    });
    await budgetInitial.save();
    res.status(201).json(budgetInitial);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/budget/initial → récupérer le(s) budget(s) initial(aux)
router.get('/initial', async (req, res) => {
  try {
    const budgets = await Budget.find({ type: 'budget_initial' });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;