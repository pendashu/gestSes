const express = require('express');
const router = express.Router();
const Carburant = require('../models/Carburant');

// GET /api/carburant — Lire tous les pleins
router.get('/', async (req, res) => {
  try {
    const pleins = await Carburant.find();
    res.json(pleins);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/carburant — Ajouter un plein
router.post('/', async (req, res) => {
  try {
    const nouveauPlein = new Carburant(req.body);
    await nouveauPlein.save();
    res.status(201).json(nouveauPlein);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/carburant/:id — Supprimer un plein (optionnel)
router.delete('/:id', async (req, res) => {
  try {
    const plein = await Carburant.findByIdAndDelete(req.params.id);
    if (!plein) return res.status(404).json({ error: "Plein non trouvé" });
    res.json({ message: "Plein supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;