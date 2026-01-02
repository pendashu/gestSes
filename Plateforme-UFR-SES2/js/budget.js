let budgetTotal = 1500000; // valeur par défaut

async function chargerDepenses() {
  try {
    // 🔑 Récupère le budget initial depuis le backend
    const resBudget = await fetch("http://localhost:5000/api/budget/initial");
    const budgets = await resBudget.json();
    if (budgets.length > 0) {
      budgetTotal = budgets.reduce((sum, b) => sum + b.montant, 0);
    }

    // 💰 Récupère les dépenses
    const resDepenses = await fetch("http://localhost:5000/api/budget");
    const depenses = await resDepenses.json();
    const totalDepenses = depenses.reduce((sum, d) => sum + d.montant, 0);
    const solde = budgetTotal - totalDepenses;

    // 📊 Mise à jour du DOM
    document.getElementById("total").textContent = budgetTotal.toLocaleString() + " FCFA";
    document.getElementById("depenses").textContent = totalDepenses.toLocaleString() + " FCFA";
    document.getElementById("solde").textContent = solde.toLocaleString() + " FCFA";

    const statutEl = document.getElementById("statut");
    if (solde < 0) {
      statutEl.innerHTML = "🔴 Dépassement";
      statutEl.style.color = "red";
    } else if (solde < budgetTotal * 0.2) {
      statutEl.innerHTML = "⚠️ Attention";
      statutEl.style.color = "orange";
    } else {
      statutEl.innerHTML = "✅ Normal";
      statutEl.style.color = "green";
    }

    // 📋 Historique
    const liste = document.getElementById("listeDepenses");
    liste.innerHTML = depenses.length === 0 
      ? "<li>Aucune dépense</li>" 
      : depenses.map(d => 
          `<li>${d.date} : ${d.motif} — ${d.montant.toLocaleString()} FCFA</li>`
        ).join('');
  } catch (err) {
    console.error("Erreur budget :", err);
    alert("⚠️ Impossible de charger les données.");
  }
}

// 📥 Soumettre le budget initial
document.getElementById("formBudgetInitial")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  budgetTotal = parseInt(document.getElementById("budgetTotal").value); // ✅ Pas de 'const'

  try {
    await fetch("http://localhost:5000/api/budget/initial", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ montant: budgetTotal })
    });
    alert("✅ Budget initial enregistré !");
    chargerDepenses();
  } catch (err) {
    alert("❌ Erreur lors de l'enregistrement du budget.");
    console.error(err);
  }
});

// ➕ Ajouter une dépense
document.getElementById("formDepense")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const data = {
    motif: document.getElementById("motif").value,
    montant: parseFloat(document.getElementById("montant").value),
    date: document.getElementById("date").value
  };

  try {
    await fetch("http://localhost:5000/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    alert("✅ Dépense ajoutée !");
    chargerDepenses();
  } catch (err) {
    alert("❌ Erreur lors de l'ajout.");
    console.error(err);
  }
});

// 🎯 Chargement initial
document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "comptable_finance") {
    alert("accès réservé au comptable finance");
    window.location.href = "index.html";
  }
  document.getElementById("welcomeName").textContent = user.name;
  chargerDepenses();
});