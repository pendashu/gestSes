const express = require('express');
const router = express.Router();
const Per = require('../models/Per');

// GET /api/per
router.get('/', async (req, res) => {
  try {
    const pers = await Per.find();
    res.json(pers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/per
router.post('/', async (req, res) => {
  try {
    const nouveauPER = new Per(req.body);
    await nouveauPER.save();
    res.status(201).json(nouveauPER);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/per/:id/statut — Valider ou refuser une PER
router.patch('/:id/statut', async (req, res) => {
  try {
    const { statut } = req.body;
    if (!['validé', 'refusé'].includes(statut)) {
      return res.status(400).json({ error: "Statut invalide" });
    }

    const per = await Per.findByIdAndUpdate(
      req.params.id,
      { statut },
      { new: true }
    );

    if (!per) return res.status(404).json({ error: "PER introuvable" });
    res.json(per);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;