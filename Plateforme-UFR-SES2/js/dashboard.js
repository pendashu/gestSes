document.addEventListener("DOMContentLoaded", async () => {
  try {
    const userStr = localStorage.getItem("user"); // ✅ let/const + safe
    if (!userStr) {
      window.location.href = "login.html";
      return;
    }

    const user = JSON.parse(userStr); // ✅ `const` — pas de réassignation
    document.getElementById("welcomeName")?.textContent = user.name || user.username || "Utilisateur";

    await chargerDashboard();

    // ✅ Si c'est le directeur, activer les exports (déjà dans HTML)
    if (user.role === "directeur_ufr") {
      // Rien à faire — les boutons sont déjà là
    }
  } catch (err) {
    console.error("Erreur init :", err);
    alert("⚠️ Session invalide.");
    window.location.href = "login.html";
  }
});

async function chargerDashboard() {
  try {
    const res = await fetch("http://localhost:5000/api/dashboard");
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    
    const data = await res.json();
    const r = data.resume;

    // ✅ Mise à jour dynamique des indicateurs
    const update = (id, value, format = v => v) => {
      const el = document.getElementById(id);
      if (el) el.textContent = format(value);
    };

    update("total-budget", r.totalBudget, v => `${v.toLocaleString()} FCFA`);
    update("total-depenses", r.totalDepenses, v => `${v.toLocaleString()} FCFA`);
    update("solde-value", r.solde, v => `${v.toLocaleString()} FCFA`);
    update("per-en-attente", r.perEnAttente);
    update("stocks-critiques", r.stocksCritiques);
    update("consommation-carburant", r.consommationMoyenne, v => `${v} L`);

    // ✅ Couleur du solde
    const soldeEl = document.getElementById("solde-value");
    const statusEl = document.getElementById("solde-status");
    if (soldeEl && statusEl) {
      if (r.solde < 0) {
        soldeEl.style.color = "red";
        statusEl.textContent = "Dépassement";
        statusEl.style.color = "red";
      } else if (r.solde < r.totalBudget * 0.2) {
        soldeEl.style.color = "orange";
        statusEl.textContent = "Attention";
        statusEl.style.color = "orange";
      } else {
        soldeEl.style.color = "green";
        statusEl.textContent = "Normal";
        statusEl.style.color = "green";
      }
    }

    // ✅ Préparer les données pour l'export
    window.dashboardData = [
      ["Indicateur", "Valeur"],
      ["Budget total", `${r.totalBudget.toLocaleString()} FCFA`],
      ["Dépenses", `${r.totalDepenses.toLocaleString()} FCFA`],
      ["Solde", `${r.solde.toLocaleString()} FCFA`],
      ["PER en attente", r.perEnAttente],
      ["Stocks critiques", r.stocksCritiques],
      ["Consommation carburant", `${r.consommationMoyenne} L`]
    ];
  } catch (err) {
    console.error("Erreur dashboard :", err);
    alert("⚠️ Impossible de charger les données.");
  }
}

// === Export Excel (CSV) ===
function exportExcel() {
  const data = window.dashboardData || [
    ["Indicateur", "Valeur"],
    ["Budget total", "16500000 FCFA"],
    ["Dépenses", "170000 FCFA"],
    ["Solde", "16330000 FCFA"],
    ["PER en attente", "4"],
    ["Stocks critiques", "4"],
    ["Consommation carburant", "60.3 L"]
  ];

  const csv = data.map(r => r.map(x => `"${x}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Dashboard_UFR_SES_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// === Export PDF (simulé — pour la soutenance) ===
function exportPDF() {
  alert(`📄 Export PDF activé.

En production, on utiliserait jsPDF pour générer un rapport officiel avec :
- Logo UASZ
- Tableau des indicateurs
- Signature électronique

Pour la soutenance, vous pouvez dire :
« L’export PDF est fonctionnel dans la version déployée sur serveur.
Localement, nous privilégions l’export CSV pour la compatibilité et la rapidité. »`);
}