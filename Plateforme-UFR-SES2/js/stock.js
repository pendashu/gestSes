let currentUser = null;

// === Charger les stocks (avec mouvements) ===
async function chargerStocks() {
  try {
    const res = await fetch("http://localhost:5000/api/stock"); // ← sans "s"
    const stocks = await res.json();
    const liste = document.getElementById("listeStocks");
    if (!liste) return;

    liste.innerHTML = stocks.length === 0 
      ? "<li>📭 Aucun stock enregistré</li>" 
      : stocks.map(s => {
          const stockActuel = s.entrees - s.sorties;
          const critique = stockActuel <= s.seuil;
          return `
            <li>
              <strong>${s.nom}</strong> — 
              ${stockActuel} / ${s.seuil} 
              <span style="color:${critique ? 'red' : 'green'}">
                ${critique ? '⚠️ Critique' : '✅ OK'}
              </span><br>
              <small>Entrées : ${s.entrees} | Sorties : ${s.sorties}</small>
              <br>
              <button onclick="mouvement('${s._id}', 'entree')" style="margin:5px;background:#2e7d32;color:white;border:none;padding:4px 8px;border-radius:3px;">➕ Entrée</button>
              <button onclick="mouvement('${s._id}', 'sortie')" style="margin:5px;background:#c62828;color:white;border:none;padding:4px 8px;border-radius:3px;">➖ Sortie</button>
            </li>`;
        }).join('');
  } catch (err) {
    console.error("Erreur chargement stocks :", err);
    document.getElementById("listeStocks").innerHTML = "<li>⚠️ Erreur de chargement</li>";
  }
}

// === Enregistrer un mouvement (entrée/sortie) ===
async function mouvement(id, type) {
  const quantite = parseInt(prompt(`Combien d'unités à ${type === 'entree' ? 'entrer' : 'sortir'} ?`));
  if (!quantite || quantite <= 0) return;

  try {
    await fetch(`http://localhost:5000/api/stock/${id}/mouvement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, quantite })
    });
    alert(`✅ ${quantite} unités enregistrées en ${type}.`);
    chargerStocks();
  } catch (err) {
    alert("❌ Erreur ou stock insuffisant.");
    console.error(err);
  }
}

// === Gestion de la redirection depuis PER ===
async function gererPER() {
  const urlParams = new URLSearchParams(window.location.search);
  const perId = urlParams.get('perId');
  const objet = urlParams.get('objet') || "Matériel";
  const quantite = parseInt(urlParams.get('quantite')) || 1;

  if (perId && quantite > 0) {
    try {
      // 1. Charger tous les stocks
      const res = await fetch("http://localhost:5000/api/stock");
      const stocks = await res.json();

      // 2. Chercher le stock correspondant
      const stock = stocks.find(s => 
        s.nom.toLowerCase().includes(objet.toLowerCase().split(' ')[0])
      );

      const msgEl = document.getElementById("messagePer");
      if (!msgEl) return;

      if (!stock) {
        // ❌ Stock introuvable
        msgEl.innerHTML = `
          <strong>⚠️ Stock non trouvé</strong><br>
          Aucun stock correspondant à « ${objet} ».<br>
          Veuillez créer le stock manuellement.
        `;
        msgEl.style.display = "block";
        msgEl.style.background = "#ffebee";
        return;
      }

      // 3. Calculer le stock disponible
      const disponible = stock.entrees - stock.sorties;

      if (quantite > disponible) {
        // ❌ Quantité non disponible
        msgEl.innerHTML = `
          <strong>❌ Quantité non disponible</strong><br>
          Demandé : <strong>${quantite}</strong> unités<br>
          Disponible : <strong>${disponible}</strong> unités de <em>${stock.nom}</em><br>
          <small>Veuillez ajuster la demande ou approvisionner le stock.</small>
        `;
        msgEl.style.display = "block";
        msgEl.style.background = "#ffebee";
        msgEl.style.borderLeftColor = "#c62828";
      } else {
        // ✅ Quantité disponible → pré-remplir le formulaire
        msgEl.innerHTML = `
          <strong>✅ PER validée</strong><br>
          À sortir : <strong>${quantite} unités</strong> de <em>${stock.nom}</em><br>
          <button onclick="autoRemplirSortie('${stock._id}', '${stock.nom}', ${quantite})"
            style="margin-top:10px;background:#1976d2;color:white;border:none;padding:8px 16px;border-radius:4px;">
            📋 Pré-remplir le PV de sortie
          </button>
        `;
        msgEl.style.display = "block";
        msgEl.style.background = "#e8f5e9";
        msgEl.style.borderLeftColor = "#2e7d32";
      }
    } catch (err) {
      console.error("Erreur lors du traitement PER :", err);
      const msgEl = document.getElementById("messagePer");
      if (msgEl) {
        msgEl.innerHTML = `⚠️ Erreur de chargement des stocks.`;
        msgEl.style.display = "block";
        msgEl.style.background = "#ffebee";
      }
    }
  }
}

// === Pré-remplir le formulaire de sortie ===
function autoRemplirSortie(stockId, nom, quantite) {
  // Si tu as un formulaire de sortie dans stocks.html, décommente :
  /*
  document.getElementById("sortie-stock-id")?.value = stockId;
  document.getElementById("sortie-nom")?.value = nom;
  document.getElementById("sortie-quantite")?.value = quantite;
  document.getElementById("sortie-type")?.value = "sortie";
  */
  
  alert(`✅ Formulaire pré-rempli pour ${quantite} unités de "${nom}".`);
  // Optionnel : scroll vers le formulaire
  // document.getElementById("formSortie")?.scrollIntoView({ behavior: "smooth" });
}

// === Sortie directe depuis une PER ===
async function sortirDepuisPER(objet, quantite) {
  try {
    // 1. Trouver le stock correspondant (ex: "Stylos bleus" → chercher un stock contenant "stylo")
    const res = await fetch("http://localhost:5000/api/stock");
    const stocks = await res.json();
    
    const stock = stocks.find(s => 
      s.nom.toLowerCase().includes(objet.toLowerCase().split(' ')[0])
    );

    if (!stock) {
      alert(`❌ Aucun stock trouvé pour "${objet}". Veuillez créer le stock d'abord.`);
      return;
    }

    // 2. Vérifier disponibilité
    const stockActuel = stock.entrees - stock.sorties;
    if (quantite > stockActuel) {
      alert(`❌ Stock insuffisant : il reste ${stockActuel} unités.`);
      return;
    }

    // 3. Enregistrer la sortie
    await fetch(`http://localhost:5000/api/stock/${stock._id}/mouvement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "sortie", quantite })
    });

    alert(`✅ ${quantite} unités de "${objet}" sorties avec succès.`);
    window.location.href = "per.html"; // Retour aux PER
  } catch (err) {
    alert("❌ Erreur lors de la sortie.");
    console.error(err);
  }
}

// === Chargement principal ===
document.addEventListener("DOMContentLoaded", () => {
  try {
    currentUser = JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    currentUser = null;
  }

  if (!currentUser || !["comptable_matiere", "comptable_finance"].includes(currentUser.role)) {
    alert("accès réservé au personnel comptable");
    window.location.href = "index.html";
    return;
  }
  chargerStocks();
  remplirListesStocks(); // ✅ Nouvelle ligne
  gererPER();

  // ✅ Génération PV N°
document.getElementById("pv-date").textContent = new Date().toLocaleDateString('fr-FR');
document.getElementById("pv-num").textContent = "PV-" + Date.now().toString().slice(-6);

// ✅ Basculer entre Entrée / Sortie
document.querySelectorAll('input[name="type"]').forEach(radio => {
  radio.addEventListener("change", function() {
    const entreeDiv = document.getElementById("champs-entree");
    const sortieDiv = document.getElementById("champs-sortie");
    if (this.value === "entree") {
      entreeDiv.style.display = "block";
      sortieDiv.style.display = "none";
      document.getElementById("pv-materiel").focus();
    } else {
      entreeDiv.style.display = "none";
      sortieDiv.style.display = "block";
      document.getElementById("pv-beneficiaire").focus();
    }
  });
});

// ✅ Soumission
document.getElementById("btn-enregistrer")?.addEventListener("click", async () => {
  const type = document.querySelector('input[name="type"]:checked')?.value;
  const materiel = document.getElementById("pv-materiel")?.value.trim();
  const quantite = parseInt(document.getElementById("pv-quantite")?.value);
  const motif = document.getElementById("pv-motif")?.value.trim();

  if (!type || !materiel || !quantite || !motif) {
    alert("⚠️ Veuillez remplir tous les champs obligatoires.");
    return;
  }

  try {
    // 1. Chercher ou créer le stock
    let stock;
    const res = await fetch("http://localhost:5000/api/stock");
    const stocks = await res.json();
    stock = stocks.find(s => s.nom.toLowerCase() === materiel.toLowerCase());

    if (!stock) {
      // Créer le stock
      const newStock = await fetch("http://localhost:5000/api/stock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: materiel,
          seuil: 5,
          entrees: type === "entree" ? quantite : 0,
          sorties: type === "sortie" ? quantite : 0
        })
      });
      stock = await newStock.json();
    } else {
      // Enregistrer le mouvement
      await fetch(`http://localhost:5000/api/stock/${stock._id}/mouvement`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, quantite })
      });
    }

    alert(`✅ ${type === 'entree' ? 'Entrée' : 'Sortie'} de ${quantite} unités de "${materiel}" enregistrée.`);
    chargerStocks();
    
    // Réinitialiser
    document.getElementById("pv-materiel").value = "";
    document.getElementById("pv-quantite").value = "1";
    document.getElementById("pv-motif").value = "";
    document.getElementById("pv-bl").value = "";
    document.getElementById("pv-fournisseur").value = "";
    document.getElementById("pv-beneficiaire").value = "";
    document.getElementById("pv-service").value = "";
    
    // Focus
    document.getElementById("pv-materiel").focus();
  } catch (err) {
    alert("❌ Erreur lors de l'enregistrement.");
    console.error(err);
  }
});
  
});

// === Formulaire d'ajout de stock (si tu l'utilises encore) ===
document.getElementById("formStock")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    nom: document.getElementById("nom")?.value,
    seuil: parseInt(document.getElementById("seuil")?.value) || 5,
    entrees: parseInt(document.getElementById("stock")?.value) || 0,
    sorties: 0
  };

// === Remplir les listes déroulantes des stocks ===
function remplirListesStocks() {
  fetch("http://localhost:5000/api/stock")
    .then(res => res.json())
    .then(stocks => {
      const entreeSelect = document.getElementById("entree-stock-id");
      const sortieSelect = document.getElementById("sortie-stock-id");

      const options = stocks.map(s => 
        `<option value="${s._id}">${s.nom} (${s.entrees - s.sorties} dispo)</option>`
      ).join('');

      if (entreeSelect) entreeSelect.innerHTML = `<option value="">— Sélectionner —</option>` + options;
      if (sortieSelect) sortieSelect.innerHTML = `<option value="">— Sélectionner —</option>` + options;
    })
    .catch(err => console.error("Erreur chargement stocks pour PV :", err));
}

  try {
    await fetch("http://localhost:5000/api/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    alert("✅ Stock créé !");
    chargerStocks();
  } catch (err) {
    alert("❌ Erreur");
    console.error(err);
  }
});

document.getElementById("formPVSortie")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const stockId = document.getElementById("sortie-stock-id")?.value;
  const quantite = parseInt(document.getElementById("sortie-quantite")?.value);
  if (!stockId || !quantite) return;

  try {
    await fetch(`http://localhost:5000/api/stock/${stockId}/mouvement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "sortie", quantite })
    });
    alert("✅ Sortie enregistrée !");
    chargerStocks();
    document.getElementById("formPVSortie")?.reset();
  } catch (err) {
    alert("❌ Erreur ou stock insuffisant.");
  }
});

// === Soumission PV Entrée ===
document.getElementById("formPVEntree")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const stockId = document.getElementById("entree-stock-id")?.value;
  const quantite = parseInt(document.getElementById("entree-quantite")?.value);
  if (!stockId || !quantite || quantite <= 0) return;

  try {
    await fetch(`http://localhost:5000/api/stock/${stockId}/mouvement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "entree", quantite })
    });
    alert("✅ Entrée enregistrée !");
    chargerStocks();
    remplirListesStocks();
    e.target.reset();
  } catch (err) {
    alert("❌ Erreur lors de l'entrée.");
    console.error(err);
  }
});

// === Soumission PV Sortie ===
document.getElementById("formPVSortie")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const stockId = document.getElementById("sortie-stock-id")?.value;
  const quantite = parseInt(document.getElementById("sortie-quantite")?.value);
  const motif = document.getElementById("sortie-motif")?.value;
  if (!stockId || !quantite || !motif || quantite <= 0) return;

  try {
    await fetch(`http://localhost:5000/api/stock/${stockId}/mouvement`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "sortie", quantite })
    });
    alert("✅ Sortie enregistrée !");
    chargerStocks();
    remplirListesStocks();
    e.target.reset();
  } catch (err) {
    alert("❌ Stock insuffisant ou erreur.");
    console.error(err);
  }
});