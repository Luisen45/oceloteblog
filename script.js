/* script.js — Ocelote Comunidad (página de inicio introductoria) */
document.addEventListener("DOMContentLoaded", () => {
  /* =========================================================
   * NAV: toggle móvil + smooth scroll para anclas
   * ========================================================= */
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", () => {
      const open = navMenu.classList.toggle("show");
      navToggle.setAttribute("aria-expanded", String(open));
    });

    navMenu.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", e => {
        const href = a.getAttribute("href") || "";
        if (href.startsWith("#")) {
          e.preventDefault();
          const target = document.getElementById(href.slice(1));
          if (target) {
            const offset = 60; // altura aprox. del header
            const y = target.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
          navMenu.classList.remove("show");
          navToggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  /* =========================================================
   * FOOTER: año actual
   * ========================================================= */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* =========================================================
   * REVEAL ON SCROLL: animación de entrada
   * ========================================================= */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("is-visible"); });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  /* =========================================================
   * ANUNCIOS (4 tarjetas): Lightbox + navegación
   * - Click/Enter abre visor con imagen grande, texto y botón a sección
   * - Soporta ESC para cerrar y ← / → para navegar
   * ========================================================= */
  const cards = Array.from(document.querySelectorAll(".story-card"));
  const lightbox = document.getElementById("lightbox");
  const lbImg = document.getElementById("lbImg");
  const lbTitle = document.getElementById("lbTitle");
  const lbDesc = document.getElementById("lbDesc");
  const lbLink = document.getElementById("lbLink");
  const lbClose = document.getElementById("lbClose");
  const lbPrev = document.getElementById("lbPrev");
  const lbNext = document.getElementById("lbNext");
  const lbBackdrop = document.getElementById("lbBackdrop");

  // Extrae datos desde la tarjeta (DOM)
  const getCardData = (card) => {
    const imgEl = card.querySelector("img");
    const titleEl = card.querySelector(".story-info h3");
    const descEl = card.querySelector(".story-info p");
    return {
      img: imgEl ? imgEl.getAttribute("src") : "",
      title: titleEl ? titleEl.textContent.trim() : "",
      desc: descEl ? descEl.textContent.trim() : "",
      link: card.getAttribute("data-link") || "#"
    };
  };

  let current = -1;
  let lastFocused = null;

  const preload = (src) => { if (!src) return; const i = new Image(); i.src = src; };

  const openLightbox = (index) => {
    if (!lightbox || !cards.length) return;
    current = (index + cards.length) % cards.length;
    const data = getCardData(cards[current]);

    lbImg.setAttribute("src", data.img);
    lbImg.setAttribute("alt", data.title || "Anuncio OceloteApp");
    lbTitle.textContent = data.title || "";
    lbDesc.textContent = data.desc || "";
    lbLink.setAttribute("href", data.link);

    // Pre-carga prev/next para navegación fluida
    const nextIdx = (current + 1) % cards.length;
    const prevIdx = (current - 1 + cards.length) % cards.length;
    preload(getCardData(cards[nextIdx]).img);
    preload(getCardData(cards[prevIdx]).img);

    lastFocused = document.activeElement;
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    lbClose.focus();
    document.body.style.overflow = "hidden"; // evita scroll de fondo
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    current = -1;
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  };

  const goto = (dir) => {
    if (current < 0) return;
    openLightbox(current + dir);
  };

  // Eventos de tarjetas
  cards.forEach((card, idx) => {
    card.addEventListener("click", () => openLightbox(idx));
    card.addEventListener("keypress", (e) => { if (e.key === "Enter") openLightbox(idx); });
  });

  // Controles del lightbox
  lbClose?.addEventListener("click", closeLightbox);
  lbBackdrop?.addEventListener("click", closeLightbox);
  lbPrev?.addEventListener("click", () => goto(-1));
  lbNext?.addEventListener("click", () => goto(1));

  // Teclado global cuando el lightbox está abierto
  document.addEventListener("keydown", (e) => {
    if (!lightbox || !lightbox.classList.contains("open")) return;
    if (e.key === "Escape") closeLightbox();
    else if (e.key === "ArrowLeft") goto(-1);
    else if (e.key === "ArrowRight") goto(1);
  });

  /* =========================================================
   * NOTA:
   * Esta página de inicio NO incluye videos, flashcards ni calculadora.
   * Las lógicas de OceloteApp y Dr Hermman deben vivir en sus propias páginas.
   * ========================================================= */
});
