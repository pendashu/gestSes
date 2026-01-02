document.addEventListener("DOMContentLoaded", () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || user.role !== "comptable_matiere") {
    alert("accès réservé au comptable matière");
    window.location.href = "index.html";
  }
  document.getElementById("welcomeName").textContent = user.name;
  chargerPleins();
});

async function chargerPleins() {
  try {
    const res = await fetch("http://localhost:5000/api/carburant");
    const pleins = await res.json();
    
    const tbody = document.querySelector("#tableauCarburant tbody");
    tbody.innerHTML = pleins.length === 0 
      ? `<tr><td colspan="7" class="text-center">Aucune attribution enregistrée</td></tr>`
      : pleins.map(p => `
        <tr>
          <td>${p.semaine || p.date}</td>
          <td>${p.vehicule}</td>
          <td>${p.conducteur}</td>
          <td>${p.kilometrage}</td>
          <td>${p.quantite} L</td>
          <td>${p.cout.toLocaleString()}</td>
          <td><span class="badge ${p.statut === 'Attribué' ? 'bg-info' : 'bg-success'}">${p.statut}</span></td>
        </tr>
      `).join('');
  } catch (err) {
    console.error("Erreur carburant :", err);
    document.querySelector("#tableauCarburant tbody").innerHTML = 
      `<tr><td colspan="7" class="text-center text-danger">⚠️ Impossible de charger les données.</td></tr>`;
  }
}

document.getElementById("formCarburant")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  
  const data = {
    semaine: document.getElementById("semaine").value,
    vehicule: document.getElementById("vehicule").value,
    conducteur: document.getElementById("conducteur").value,
    kilometrage: parseInt(document.getElementById("kilometrage").value),
    quantite: parseFloat(document.getElementById("quantite").value),
    cout: parseInt(document.getElementById("cout").value),
    statut: document.getElementById("statut").value
  };

  try {
    await fetch("http://localhost:5000/api/carburant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    alert("✅ Attribution enregistrée !");
    chargerPleins();
    document.getElementById("formCarburant").reset(); // ✅ Vide le formulaire
  } catch (err) {
    alert("❌ Erreur lors de l'enregistrement.");
  }
});