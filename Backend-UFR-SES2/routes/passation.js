const express = require('express');
const router = express.Router();
const Passation = require('../models/Passation');

// GET /api/passation — Lire tous les lots
router.get('/', async (req, res) => {
  try {
    const lots = await Passation.find();
    res.json(lots);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/passation — Ajouter un lot
router.post('/', async (req, res) => {
  try {
    const nouveauLot = new Passation(req.body);
    await nouveauLot.save();
    res.status(201).json(nouveauLot);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PUT /api/passation/:id — Mettre à jour le statut d’un lot (optionnel)
router.put('/:id/statut', async (req, res) => {
  try {
    const { statut } = req.body;
    const lot = await Passation.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true }
    );
    if (!lot) return res.status(404).json({ error: "Lot non trouvé" });
    res.json(lot);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;