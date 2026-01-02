const express = require('express');
const router = express.Router();
const Stock = require('../models/Stock');

// GET /api/stocks — Lire tous les stocks
router.get('/', async (req, res) => {
  try {
    const stocks = await Stock.find();
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/stocks — Ajouter un stock
router.post('/', async (req, res) => {
  try {
    const nouveauStock = new Stock(req.body);
    await nouveauStock.save();
    res.status(201).json(nouveauStock);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/stocks/:id — Supprimer un stock (optionnel)
router.delete('/:id', async (req, res) => {
  try {
    const stock = await Stock.findByIdAndDelete(req.params.id);
    if (!stock) return res.status(404).json({ error: "Stock non trouvé" });
    res.json({ message: "Stock supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// POST /api/stock/:id/mouvement
router.post('/:id/mouvement', async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) return res.status(404).json({ error: "Stock introuvable" });

    const { type, quantite } = req.body;
    if (type === 'entree') {
      stock.entrees += quantite;
    } else if (type === 'sortie') {
      if (quantite > stock.stockActuel) {
        return res.status(400).json({ error: "Stock insuffisant" });
      }
      stock.sorties += quantite;
    } else {
      return res.status(400).json({ error: "Type invalide (entree/sortie)" });
    }

    await stock.save();
    res.json(stock);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
module.exports = router;