document.addEventListener("DOMContentLoaded", () => {
  /* --- Nav toggle + smooth scroll --- */
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
          const id = href.slice(1);
          const el = document.getElementById(id);
          if (el) window.scrollTo({ top: el.offsetTop - 60, behavior: "smooth" });
          navMenu.classList.remove("show");
          navToggle.setAttribute("aria-expanded", "false");
        }
      });
    });
  }

  /* --- Flashcards --- */
  document.querySelectorAll(".flashcard").forEach(card => {
    const toggle = () => {
      const ans = card.querySelector(".answer");
      const open = ans && ans.style.display !== "block";
      if (ans) ans.style.display = open ? "block" : "none";
      card.setAttribute("aria-expanded", String(open));
    };
    card.addEventListener("click", toggle);
    card.addEventListener("keypress", e => { if (e.key === "Enter") toggle(); });
  });

  /* --- Calculadora (evaluación segura) --- */
  const display = document.getElementById("display");
  if (display) {
    document.querySelectorAll("[data-k]").forEach(btn => {
      btn.addEventListener("click", () => display.value += btn.dataset.k);
    });
    const eq = document.getElementById("eq");
    const clr = document.getElementById("clear");
    eq && eq.addEventListener("click", () => {
      const expr = display.value.trim();
      if(!/^[0-9+\-*/().\s]+$/.test(expr)){ display.value = "Error"; return; }
      try{
        // eslint-disable-next-line no-new-func
        const res = Function(`"use strict";return (${expr})`)();
        display.value = (res ?? "Error");
      }catch{ display.value = "Error"; }
    });
    clr && clr.addEventListener("click", () => display.value = "");
  }

  /* --- Formulario (demo) --- */
  const form = document.getElementById("contestForm");
  const msg = document.getElementById("formMsg");
  if (form && msg) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      msg.textContent = "¡Gracias! Registramos tu interés. (Demo local)";
      form.reset();
    });
  }

  /* --- Año dinámico --- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
