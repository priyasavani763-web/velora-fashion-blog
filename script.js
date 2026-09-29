document.addEventListener("DOMContentLoaded", () => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => document.querySelectorAll(s);

  // Mobile navigation
  $("#menuBtn").addEventListener("click", () => $("#mainNav").classList.toggle("open"));
  $$("#mainNav a").forEach(a => a.addEventListener("click", () => $("#mainNav").classList.remove("open")));

  // Modal helpers
  const openModal = id => $("#" + id).classList.add("open");
  const closeModal = id => $("#" + id).classList.remove("open");
  $$(".close-modal").forEach(btn => btn.addEventListener("click", () => closeModal(btn.dataset.close)));
  $$(".modal-overlay").forEach(overlay => overlay.addEventListener("click", e => {
    if (e.target === overlay) overlay.classList.remove("open");
  }));

  // Login / signup with frontend validation + localStorage demo
  let signupMode = false;
  $("#accountBtn").addEventListener("click", () => openModal("authModal"));
  $("#switchAuth").addEventListener("click", () => {
    signupMode = !signupMode;
    $$(".signup-only").forEach(el => el.classList.toggle("hidden", !signupMode));
    $("#authEyebrow").textContent = signupMode ? "JOIN VELORA" : "WELCOME BACK";
    $("#authTitle").textContent = signupMode ? "Create your account" : "Log in to VELORA";
    $("#authSubmit").textContent = signupMode ? "Create account →" : "Log in →";
    $("#switchText").textContent = signupMode ? "Already a member?" : "New here?";
    $("#switchAuth").textContent = signupMode ? "Log in" : "Create an account";
  });

  $("#authForm").addEventListener("submit", e => {
    e.preventDefault();
    const email = $("#email").value.trim();
    const password = $("#password").value;
    const name = $("#fullName").value.trim();
    let valid = true;

    $("#emailError").textContent = "";
    $("#passwordError").textContent = "";

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      $("#emailError").textContent = "Please enter a valid email address.";
      valid = false;
    }
    if (password.length < 6) {
      $("#passwordError").textContent = "Password must contain at least 6 characters.";
      valid = false;
    }
    if (signupMode && name.length < 2) {
      showToast("Please enter your full name.");
      valid = false;
    }
    if (!valid) return;

    if (signupMode) {
      localStorage.setItem("veloraUser", JSON.stringify({name, email}));
      showToast("Account created successfully!");
    } else {
      showToast("Login successful — welcome to VELORA!");
    }
    closeModal("authModal");
    $("#authForm").reset();
  });

  // Product filters
  $$("#filters .filter").forEach(btn => btn.addEventListener("click", () => {
    $$("#filters .filter").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const filter = btn.dataset.filter;
    let visible = 0;
    $$("#productGrid .product-card").forEach(card => {
      const show = filter === "all" || card.dataset.category === filter;
      card.style.display = show ? "" : "none";
      if (show) visible++;
    });
    $("#noResults").style.display = visible ? "none" : "block";
  }));

  // Favorites
  let favorites = JSON.parse(localStorage.getItem("veloraFavorites") || "[]");
  const updateFavorites = () => {
    $("#favCount").textContent = favorites.length;
    $$(".heart").forEach(btn => {
      const saved = favorites.includes(btn.dataset.id);
      btn.classList.toggle("saved", saved);
      btn.textContent = saved ? "♥" : "♡";
    });
    localStorage.setItem("veloraFavorites", JSON.stringify(favorites));
  };
  $$(".heart").forEach(btn => btn.addEventListener("click", () => {
    const id = btn.dataset.id;
    if (favorites.includes(id)) {
      favorites = favorites.filter(x => x !== id);
      showToast("Removed from your favorites.");
    } else {
      favorites.push(id);
      showToast("Saved to your favorites ♡");
    }
    updateFavorites();
  }));
  $("#favoritesBtn").addEventListener("click", () => {
    const savedCards = [...$$(".product-card")].filter(c => favorites.includes(c.querySelector(".heart").dataset.id));
    if (!savedCards.length) return showToast("Your favorites are empty — explore the edit!");
    savedCards.forEach(c => c.scrollIntoView({behavior:"smooth", block:"center"}));
  });
  updateFavorites();

  // Search
  $("#searchBtn").addEventListener("click", () => {
    openModal("searchModal");
    $("#searchInput").focus();
    renderSearch("");
  });
  $("#searchInput").addEventListener("input", e => renderSearch(e.target.value));
  function renderSearch(term) {
    const q = term.toLowerCase();
    const cards = [...$$(".product-card")].filter(card => {
      const text = (card.dataset.name + " " + card.dataset.style + " " + card.dataset.category).toLowerCase();
      return text.includes(q);
    });
    $("#searchResults").innerHTML = cards.length
      ? cards.map(c => `<div class="search-item"><span>${c.dataset.name}</span><small>${c.dataset.style}</small></div>`).join("")
      : `<p style="color:#888;font-size:13px;padding-top:10px">No pieces match your search.</p>`;
  }

  // Style quiz
  const quizQuestions = [
    {q:"Pick a weekend mood.", a:[["Coffee + clean lines","minimal"],["Slow Sunday + soft layers","cozy"],["City walk + tailored coat","classic"],["Gallery opening + statement piece","bold"]]},
    {q:"Choose a color story.", a:[["Cream, white, black","minimal"],["Oat, chocolate, warm beige","cozy"],["Navy, camel, burgundy","classic"],["Cherry, cobalt, silver","bold"]]},
    {q:"Your ideal outfit has...", a:[["Simple silhouettes","minimal"],["Comfort first","cozy"],["Sharp details","classic"],["A little drama","bold"]]}
  ];
  let quizStep = 0, quizScores = {};
  function showQuiz() {
    quizStep = 0; quizScores = {};
    openModal("quizModal");
    renderQuiz();
  }
  function renderQuiz() {
    if (quizStep >= quizQuestions.length) return showQuizResult();
    const item = quizQuestions[quizStep];
    $("#quizContent").innerHTML = `
      <p style="font-size:11px;color:#999">${quizStep + 1} / ${quizQuestions.length}</p>
      <h3 class="quiz-question">${item.q}</h3>
      <div class="quiz-options">${item.a.map(([text,style]) =>
        `<button class="quiz-option" data-style="${style}">${text}</button>`).join("")}</div>`;
    $$(".quiz-option").forEach(btn => btn.addEventListener("click", () => {
      quizScores[btn.dataset.style] = (quizScores[btn.dataset.style] || 0) + 1;
      quizStep++;
      renderQuiz();
    }));
  }
  function showQuizResult() {
    const style = Object.entries(quizScores).sort((a,b) => b[1]-a[1])[0][0];
    const data = {
      minimal:["The Minimalist","Clean silhouettes, neutral tones and pieces that make simplicity look intentional."],
      cozy:["The Soft Edit","Relaxed layers, warm textures and effortless outfits that still look polished."],
      classic:["The Modern Classic","Tailoring, timeless colors and wardrobe staples with a contemporary edge."],
      bold:["The Statement Maker","Unexpected color, strong accessories and looks that start conversations."]
    }[style];
    $("#quizContent").innerHTML = `<div class="quiz-result"><p class="eyebrow">YOUR VELORA STYLE</p><h3>${data[0]}</h3><p>${data[1]}</p><button class="primary-btn full" id="quizExplore">Explore ${data[0]} →</button></div>`;
    $("#quizExplore").addEventListener("click", () => {
      closeModal("quizModal");
      $$("#productGrid .product-card").forEach(c => c.style.display = c.dataset.style === style ? "" : "none");
      $$("#filters .filter").forEach(b => b.classList.remove("active"));
      $("#noResults").style.display = "none";
      $("#discover").scrollIntoView({behavior:"smooth"});
      showToast("Your style edit is ready ✦");
    });
  }
  $("#styleQuizBtn").addEventListener("click", showQuiz);
  $("#styleQuizBtn2").addEventListener("click", showQuiz);

  // Blog story demo
  $$(".read-btn").forEach(btn => btn.addEventListener("click", () => {
    showToast(`Opening: ${btn.dataset.title}`);
  }));

  function showToast(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => toast.classList.remove("show"), 2500);
  }
});