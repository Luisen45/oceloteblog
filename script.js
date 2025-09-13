document.addEventListener("DOMContentLoaded", () => {
  /* --- Nav toggle + smooth scroll --- */
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");

  navToggle.addEventListener("click", () => {
    const open = navMenu.classList.toggle("show");
    navToggle.setAttribute("aria-expanded", String(open));
  });

  navMenu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", e => {
      e.preventDefault();
      const id = a.getAttribute("href").slice(1);
      const el = document.getElementById(id);
      if (el) {
        window.scrollTo({ top: el.offsetTop - 60, behavior: "smooth" });
      }
      navMenu.classList.remove("show");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });

  /* --- Flashcards --- */
  document.querySelectorAll(".flashcard").forEach(card => {
    card.addEventListener("click", () => toggleCard(card));
    card.addEventListener("keypress", e => { if (e.key === "Enter") toggleCard(card); });
  });
  function toggleCard(card){
    const ans = card.querySelector(".answer");
    const open = ans.style.display !== "block";
    ans.style.display = open ? "block" : "none";
    card.setAttribute("aria-expanded", String(open));
  }

  /* --- Calculadora (evaluación segura) --- */
  const display = document.getElementById("display");
  document.querySelectorAll("[data-k]").forEach(btn => {
    btn.addEventListener("click", () => display.value += btn.dataset.k);
  });
  document.getElementById("eq").addEventListener("click", () => {
    const expr = display.value.trim();
    // Permite solo dígitos, operadores básicos y paréntesis
    if(!/^[0-9+\-*/().\s]+$/.test(expr)){ display.value = "Error"; return; }
    try{
      // Eval más seguro con Function y sin acceso al scope
      // eslint-disable-next-line no-new-func
      const res = Function(`"use strict";return (${expr})`)();
      display.value = (res ?? "Error");
    }catch{ display.value = "Error"; }
  });
  document.getElementById("clear").addEventListener("click", () => display.value = "");

  /* --- Formulario (demo) --- */
  const form = document.getElementById("contestForm");
  const msg = document.getElementById("formMsg");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    msg.textContent = "¡Gracias! Registramos tu interés. (Demo local)";
    form.reset();
  });

  /* --- Año dinámico --- */
  document.getElementById("year").textContent = new Date().getFullYear();
});
