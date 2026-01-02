const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ CORS corrigé — sans espaces, URLs valides
app.use(cors({
  origin: [
    'http://127.0.0.1:5500',
    'http://localhost:5500',
    'http://localhost:8000',
    'https://pendashu.github.io'  // ✅ sans espace
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE'],
  credentials: true
}));

app.use(express.json());

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connecté"))
  .catch(err => console.error("❌ Erreur MongoDB :", err));

// ✅ Routes — /api/stock (sans "s")
app.use('/api/budget', require('./routes/budget'));
app.use('/api/per', require('./routes/per'));
app.use('/api/stock', require('./routes/stocks')); // ← sans "s"
app.use('/api/carburant', require('./routes/carburant'));
app.use('/api/passation', require('./routes/passation'));
app.use('/api/dashboard', require('./routes/dashboard'));

app.get('/', (req, res) => {
  res.send("Backend UFR SES ✅");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Serveur sur http://localhost:${PORT}`));