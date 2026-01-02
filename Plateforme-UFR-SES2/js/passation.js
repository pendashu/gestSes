document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "csa") {
    alert("accès réservé au CSA");
    window.location.href = "index.html";
  }
  document.getElementById("welcomeName").textContent = user.name;
  chargerPassation();
});

function chargerPassation() {
  const lots = [
    {
      lot: "LOT 01",
      objet: "Fourniture de matériel informatique",
      typeMarche: "Marché public",
      montantEstime: 1200000,
      procedurePassation: "Appel d'offres ouvert",
      trimestre: "T1",
      annee: 2025,
      statut: "En préparation"
    },
    {
      lot: "LOT 02",
      objet: "Maintenance des véhicules",
      typeMarche: "Marché public",
      montantEstime: 800000,
      procedurePassation: "Appel d'offres restreint",
      trimestre: "T2",
      annee: 2025,
      statut: "Lancé"
    },
    {
      lot: "LOT 03",
      objet: "Prestations de formation",
      typeMarche: "Marché public",
      montantEstime: 500000,
      procedurePassation: "Appel d'offres ouvert",
      trimestre: "T3",
      annee: 2025,
      statut: "Clôturé"
    }
  ];

  const tbody = document.querySelector("#tableauPassation tbody");
  if (!tbody) return;

  tbody.innerHTML = lots.map(lot => `
    <tr>
      <td>${lot.lot}</td>
      <td>${lot.objet}</td>
      <td>${lot.typeMarche}</td>
      <td>${lot.montantEstime.toLocaleString()} FCFA</td>
      <td>${lot.procedurePassation}</td>
      <td>${lot.trimestre}</td>
      <td>${lot.annee}</td>
      <td><span class="badge ${
        lot.statut === 'Clôturé' ? 'bg-success' : 
        lot.statut === 'Lancé' ? 'bg-warning' : 
        'bg-secondary'
      }">${lot.statut}</span></td>
    </tr>
  `).join('');

  document.getElementById("messageVide").style.display = lots.length === 0 ? "block" : "none";
}