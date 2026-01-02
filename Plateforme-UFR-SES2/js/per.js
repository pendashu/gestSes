let currentUser = null;

// === Charger les PER (uniquement pour les comptables) ===
async function chargerPER(user) {
  // ✅ On ne charge la liste que si c'est un comptable
  if (!user || !["comptable_matiere", "comptable_finance"].includes(user.role)) return;

  try {
    const res = await fetch("http://localhost:5000/api/per");
    const pers = await res.json();
    const liste = document.getElementById("listePER");
    if (!liste) return;

    liste.innerHTML = pers.length === 0 
      ? "<li>📭 Aucune demande en cours</li>" 
      : pers.map(p => {
          const actions = `<br>
            <button onclick="valider('${p._id}', true)" style="margin:5px;background:#2e7d32;color:white;border:none;padding:5px 10px;border-radius:3px;">✅ Accepter</button>
            <button onclick="valider('${p._id}', false)" style="margin:5px;background:#c62828;color:white;border:none;padding:5px 10px;border-radius:3px;">❌ Refuser</button>`;
          
          return `<li><strong>${p.objet || "Matériel"}</strong> — ${p.quantite} unité(s) — 
            <span style="color:${p.statut==='en attente'?'orange':p.statut==='validé'?'green':'red'}">${p.statut}</span>
            ${actions}</li>`;
        }).join('');
    
    // ✅ Rafraîchissement auto toutes les 10s (pour le comptable)
    setTimeout(() => chargerPER(user), 10000);
  } catch (err) {
    console.error("Erreur PER :", err);
    const liste = document.getElementById("listePER");
    if (liste) liste.innerHTML = "<li>⚠️ Erreur de chargement</li>";
  }
}

// === Valider une PER ===
async function valider(id, accepter) {
  try {
    const res = await fetch(`http://localhost:5000/api/per/${id}/statut`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ statut: accepter ? "validé" : "refusé" })
    });

    if (!res.ok) throw new Error("Échec de la validation");
    const per = await res.json();

    if (accepter) {
      const qte = per.quantite || 1;
      const objet = per.objet || "Matériel";
      window.location.href = `stocks.html?perId=${id}&objet=${encodeURIComponent(objet)}&quantite=${qte}`;
    } else {
      alert("❌ PER refusée.");
    }

    if (currentUser) chargerPER(currentUser);
  } catch (err) {
    alert("Erreur lors de la validation.");
    console.error(err);
  }
}

// === Export CSV (uniquement pour les comptables) ===
function exporterPER() {
  if (!currentUser || !["comptable_matiere", "comptable_finance"].includes(currentUser.role)) {
    alert("accès réservé au personnel comptable");
    return;
  }

  const liste = document.getElementById("listePER");
  if (!liste || !liste.children || liste.children.length === 0) {
    alert("📭 Aucune demande à exporter.");
    return;
  }

  const rows = [["Objet", "Quantité", "Statut", "Date"]];
  Array.from(liste.children).forEach(li => {
    const text = li.textContent.trim();
    if (!text || text.includes("Aucune demande")) return;

    const parts = text.split(" — ");
    if (parts.length >= 3) {
      const objet = parts[0].replace(/✅|❌|🔴|🟢|⚠️/g, '').trim();
      const quantite = parts[1].replace(/\D+/g, '') || "0";
      const statut = parts[2].replace(/✅|❌|🔴|🟢|⚠️/g, '').trim();
      rows.push([objet, quantite, statut, new Date().toLocaleDateString()]);
    }
  });

  if (rows.length === 1) {
    alert("⚠️ Aucune donnée à exporter.");
    return;
  }

  const csv = rows.map(r => r.map(x => `"${x}"`).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], {type: "text/csv;charset=utf-8"}));
  a.download = `PER_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
}

// === Chargement principal ===
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      currentUser = JSON.parse(userStr);
    }
  } catch (e) {
    currentUser = null;
  }

  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  // ✅ Affiche le nom
  const welcomeEl = document.getElementById("welcomeName");
  if (welcomeEl) {
    const name = currentUser.name || currentUser.username || "Utilisateur";
    welcomeEl.textContent = name;
  }

  // ✅ Mode formulaire seul pour l'enseignant
  const urlParams = new URLSearchParams(window.location.search);
  const mode = urlParams.get('mode');

  if (mode === 'form' && currentUser.role === 'enseignant') {
    // Masque la liste et l'export
    const listeDiv = document.getElementById("listePER")?.closest('div');
    if (listeDiv) listeDiv.style.display = 'none';
    
    const exportBtn = document.querySelector('button[onclick="exporterPER()"]');
    if (exportBtn) exportBtn.closest('div').style.display = 'none';

    // ✅ Affiche confirmation si succès
    if (urlParams.get('success') === '1') {
      const formDiv = document.querySelector('.form-container');
      if (formDiv) {
        formDiv.insertAdjacentHTML('afterend', `
          <div style="max-width:700px; margin:20px auto;">
            <div style="background:#e8f5e8; color:#2e7d32; padding:20px; border-radius:10px; text-align:center; font-size:1.1rem; font-weight:bold;">
              ✅ Votre demande a été soumise avec succès.<br>
              Le comptable a été notifié.<br><br>
              <a href="index.html" style="display:inline-block; background:#1976d2; color:white; padding:10px 20px; border-radius:6px; text-decoration:none;">
                🏠 Retour à l'accueil
              </a>
            </div>
          </div>
        `);
      }
    }
    return; // ➕ Stop ici — pas de chargement de liste
  }

  // ✅ Pour les comptables : charger la liste
  if (["comptable_matiere", "comptable_finance"].includes(currentUser.role)) {
    await chargerPER(currentUser);
  }

  // ✅ Soumission du formulaire (enseignant ou comptable)
  const form = document.getElementById("formPER");
  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!currentUser) return;

      const matriculeEl = document.getElementById("matricule");
      const motifEl = document.getElementById("motif");
      const libelleEl = document.getElementById("libelleMateriel");
      const quantiteEl = document.getElementById("quantite");
      const bureauEl = document.getElementById("bureau");

      const data = {
        demandeur: currentUser.name || currentUser.username,
        matricule: matriculeEl ? matriculeEl.value : "",
        motif: motifEl ? motifEl.value : "",
        objet: libelleEl ? libelleEl.value : "",
        quantite: quantiteEl ? parseInt(quantiteEl.value) : 1,
        bureau: bureauEl ? bureauEl.value : null,
        statut: "en attente",
        date: new Date().toISOString().split('T')[0]
      };

      try {
        await fetch("http://localhost:5000/api/per", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });

        // ✅ Enseignant → écran de confirmation
        if (currentUser.role === "enseignant") {
          window.location.href = "per.html?mode=form&success=1";
        } else {
          alert("✅ PER soumise !");
          await chargerPER(currentUser);
          form.reset();
        }
      } catch (err) {
        alert("❌ Erreur");
        console.error(err);
      }
    });
  }
});