// script.js — coherente con tu index y sin romper OceloteApp ni Dr Hermman
document.addEventListener("DOMContentLoaded", () => {
  /* -------------------------------------------
   * NAV: toggle móvil + smooth scroll a anclas
   * ------------------------------------------- */
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
          if (el) {
            const y = el.getBoundingClientRect().top + window.pageYOffset - 60;
            window.scrollTo({ top: y, behavior: "smooth" });
          }
          navMenu.classList.remove("show");
          navToggle.setAttribute("aria-expanded", "false");
        } else {
          // Si es un enlace normal (a otra página o recarga), forzamos el cierre del menú en móviles
          if (window.innerWidth <= 960) {
            navMenu.classList.remove("show");
            navToggle.setAttribute("aria-expanded", "false");
          }
        }
      });
    });
  }

  /* -------------------------------------------
   * INICIO: anuncios (tarjetas clicables)
   * - Usa data-link para navegar
   * ------------------------------------------- */
  document.querySelectorAll(".story-card").forEach(card => {
    const go = () => {
      const link = card.getAttribute("data-link");
      if (link) window.location.href = link;
    };
    card.addEventListener("click", go);
    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        go();
      }
    });
  });

  /* -------------------------------------------
   * OceloteTV: cerrar advertencia
   * ------------------------------------------- */
  const closeWarningBtn = document.querySelector("[data-close-warning]");
  if (closeWarningBtn) {
    closeWarningBtn.addEventListener("click", () => {
      // .closest() busca el ancestro más cercano que coincida con el selector
      const warningBox = closeWarningBtn.closest(".warning-box");
      if (warningBox) {
        // Ocultamos la caja de advertencia
        warningBox.style.display = "none";
      }
    });
  }

  /* -------------------------------------------
   * Flashcards simples (si existen en otra página)
   * ------------------------------------------- */
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

  /* -------------------------------------------
   * Calculadora (si existe en alguna página)
   * ------------------------------------------- */
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
        // Eval seguro acotado
        // eslint-disable-next-line no-new-func
        const res = Function(`"use strict";return (${expr})`)();
        display.value = (res ?? "Error");
      }catch{ display.value = "Error"; }
    });
    clr && clr.addEventListener("click", () => display.value = "");
  }

  /* -------------------------------------------
   * OceloteApp (app-de-estudio.html)
   * Mantiene tu lógica, con null-safety y fix de templates
   * ------------------------------------------- */
  const studyApp = document.getElementById("studyApp");
  if (studyApp) {
    const form = document.getElementById("addCardForm");
    const qInput = document.getElementById("qInput");
    const aInput = document.getElementById("aInput");
    const clearAll = document.getElementById("clearAll");
    const list = document.getElementById("cardList");

    const pc = document.getElementById("practiceCard");
    const pcQ = pc?.querySelector(".pc-q");
    const pcA = pc?.querySelector(".pc-a");
    const showAnswer = document.getElementById("showAnswer");
    const markRight = document.getElementById("markRight");
    const markWrong = document.getElementById("markWrong");
    const nextCard = document.getElementById("nextCard");
    const stats = document.getElementById("practiceStats");

    let cards = loadCards();
    let currentIndex = -1;

    function loadCards(){
      try{ return JSON.parse(localStorage.getItem("studyCards") || "[]"); }
      catch{ return []; }
    }
    function saveCards(){
      localStorage.setItem("studyCards", JSON.stringify(cards));
    }
    function escapeHtml(s){
      return s.replace(/[&<>"']/g, m => (
        {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]
      ));
    }

    function renderList(){
      if (!list) return;
      list.innerHTML = "";
      if (cards.length === 0){
        list.innerHTML = `<p class="muted">Aún no hay tarjetas.</p>`;
        if (pcQ) pcQ.textContent = "—";
        if (pcA) pcA.textContent = "—";
        if (stats) stats.textContent = "Sin tarjetas.";
        return;
      }
      cards.forEach((c, i) => {
        const row = document.createElement("div");
        row.className = "card-row";
        row.innerHTML = `
          <div class="qa">
            <div class="q">${escapeHtml(c.q)}</div>
            <div class="a">${escapeHtml(c.a)}</div>
            <div class="muted small">Aciertos: ${c.right||0} / Intentos: ${c.attempts||0}</div>
          </div>
          <div class="act">
            <button class="btn ghost" data-edit="${i}" type="button">Editar</button>
            <button class="btn" data-del="${i}" type="button">Eliminar</button>
          </div>`;
        list.appendChild(row);
      });

      list.querySelectorAll("[data-del]").forEach(b=>{
        b.addEventListener("click", ()=>{
          const i = +b.dataset.del;
          cards.splice(i,1);
          saveCards(); renderList();
          if (cards.length) pickCard(); else {
            if (pcQ) pcQ.textContent = "—";
            if (pcA) pcA.textContent = "—";
            if (stats) stats.textContent = "Sin tarjetas.";
          }
        });
      });
      list.querySelectorAll("[data-edit]").forEach(b=>{
        b.addEventListener("click", ()=>{
          const i = +b.dataset.edit;
          const nq = prompt("Editar pregunta:", cards[i].q);
          if (nq===null) return;
          const na = prompt("Editar respuesta:", cards[i].a);
          if (na===null) return;
          cards[i].q = nq.trim(); cards[i].a = na.trim();
          saveCards(); renderList();
        });
      });
    }

    function updateStats(){
      if (!stats) return;
      const totalAttempts = cards.reduce((s,c)=>s+(c.attempts||0),0);
      const totalRight = cards.reduce((s,c)=>s+(c.right||0),0);
      stats.textContent = `Tarjetas: ${cards.length} · Intentos: ${totalAttempts} · Aciertos: ${totalRight}`;
    }

    function pickCard(){
      if (!pcQ || !pcA) return;
      if (cards.length===0){
        pcQ.textContent = "—"; pcA.textContent = "—"; updateStats(); return;
      }
      currentIndex = Math.floor(Math.random()*cards.length);
      pcQ.textContent = cards[currentIndex].q;
      pcA.textContent = "•••";
      updateStats();
    }

    form?.addEventListener("submit", e=>{
      e.preventDefault();
      const q = qInput?.value.trim();
      const a = aInput?.value.trim();
      if (!q || !a) return;
      cards.push({q,a,attempts:0,right:0});
      saveCards(); renderList(); pickCard();
      if (qInput) qInput.value = "";
      if (aInput) aInput.value = "";
    });

    clearAll?.addEventListener("click", ()=>{
      if (confirm("¿Borrar todas las tarjetas?")){
        cards = []; saveCards(); renderList(); pickCard();
      }
    });

    showAnswer?.addEventListener("click", ()=>{
      if (currentIndex<0 || !pcA) return;
      pcA.textContent = cards[currentIndex].a;
    });
    markRight?.addEventListener("click", ()=>{
      if (currentIndex<0) return;
      cards[currentIndex].attempts = (cards[currentIndex].attempts||0)+1;
      cards[currentIndex].right = (cards[currentIndex].right||0)+1;
      saveCards(); renderList(); pickCard();
    });
    markWrong?.addEventListener("click", ()=>{
      if (currentIndex<0) return;
      cards[currentIndex].attempts = (cards[currentIndex].attempts||0)+1;
      saveCards(); renderList(); pickCard();
    });
    nextCard?.addEventListener("click", pickCard);

    renderList(); pickCard();
  }
});