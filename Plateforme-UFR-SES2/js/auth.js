// Liste complète des utilisateurs
const USERS = [
  { username: "matiere", password: "matiere2025", role: "comptable_matiere", name: "Comptable Matière" },
  { username: "finance", password: "finance2025", role: "comptable_finance", name: "Comptable Finance" },
  { username: "directeur", password: "directeur2025", role: "directeur_ufr", name: "Directeur UFR" },
  { username: "csa", password: "csa2025", role: "csa", name: "CSA" },
  { username: "enseignant", password: "ens2025", role: "enseignant", name: "Enseignant" },
  { username: "pats", password: "pats2025", role: "PATS", name: "PATS" },
  { username: "pas", password: "pas2025", role: "PAS", name: "PAS" }
];

// Gestion de la connexion
document.getElementById("formLogin")?.addEventListener("submit", function(e) {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const errorDiv = document.getElementById("error");

  const user = USERS.find(u => u.username === username && u.password === password);

  if (user) {
    localStorage.setItem("user", JSON.stringify(user));
    
    // ✅ Redirection par rôle
    if (user.role === "enseignant") {
      // ➕ Enseignant → formulaire seul
      window.location.href = "per.html?mode=form";
    } else {
      // 👥 Tous les autres → dashboard
      window.location.href = "dashboard.html";
    }
  } else {
    errorDiv.style.display = "block";
    errorDiv.textContent = "Identifiant ou mot de passe incorrect.";
  }
});