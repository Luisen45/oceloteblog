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

  /* -------------------------------------------
   * Dr Hermman (juego-dr-hermman.html)
   * ------------------------------------------- */
  const canvas = document.getElementById("drGame");
  if (canvas && canvas.getContext) {
    const ctx = canvas.getContext("2d");
    const startBtn = document.getElementById("startGame");
    const scoreBox = document.getElementById("scoreBox");

    if (!canvas.width) canvas.width = 900;
    if (!canvas.height) canvas.height = Math.round(900 * 9/16);

    let W = canvas.width, H = canvas.height;
    let running = false;
    const keys = {};
    const bullets = [];
    const enemies = [];
    const player = { x: W/2, y: H-50, r: 12, speed: 3 };
    let lastShot = 0;
    let lastSpawn = 0;
    let score = 0;

    window.addEventListener("keydown", e => { keys[e.key] = true; if(e.key===" ") e.preventDefault(); });
    window.addEventListener("keyup",   e => { keys[e.key] = false; });

    function shoot(t){
      if (t - lastShot < 180) return; // ms
      bullets.push({ x: player.x, y: player.y - player.r, dy: -6 });
      lastShot = t;
    }

    function spawn(t){
      if (t - lastSpawn < 900) return;
      const x = 20 + Math.random()*(W-40);
      const s = 1.2 + Math.random()*1.9;
      enemies.push({ x, y: -20, r: 12, dy: s });
      lastSpawn = t;
    }

    function step(t){
      if (!running) return;

      // mover
      if (keys["ArrowLeft"])  player.x -= player.speed;
      if (keys["ArrowRight"]) player.x += player.speed;
      if (keys["ArrowUp"])    player.y -= player.speed;
      if (keys["ArrowDown"])  player.y += player.speed;
      if (keys[" "])          shoot(t);

      player.x = Math.max(player.r, Math.min(W-player.r, player.x));
      player.y = Math.max(player.r, Math.min(H-player.r, player.y));

      bullets.forEach(b=> b.y += b.dy);
      for (let i=bullets.length-1; i>=0; i--) if (bullets[i].y < -20) bullets.splice(i,1);

      spawn(t);
      enemies.forEach(e=> e.y += e.dy);

      // colisiones
      for (let i=enemies.length-1; i>=0; i--){
        const e = enemies[i];
        // golpe al jugador
        const dxp = e.x - player.x, dyp = e.y - player.y;
        if (dxp*dxp + dyp*dyp < (e.r+player.r)*(e.r+player.r)){
          running = false;
          if (scoreBox) scoreBox.textContent = `Puntos: ${score} · ¡Game Over!`;
        }
        // balas
        for (let j=bullets.length-1; j>=0; j--){
          const b = bullets[j];
          const dxb = e.x - b.x, dyb = e.y - b.y;
          if (dxb*dxb + dyb*dyb < (e.r+6)*(e.r+6)){
            enemies.splice(i,1); bullets.splice(j,1); score++;
            if (scoreBox) scoreBox.textContent = `Puntos: ${score}`;
            break;
          }
        }
        if (e.y > H+30) enemies.splice(i,1);
      }

      // dibujar
      ctx.clearRect(0,0,W,H);
      // jugador
      ctx.fillStyle = "#6c5ce7";
      ctx.beginPath(); ctx.arc(player.x, player.y, player.r, 0, Math.PI*2); ctx.fill();
      // balas
      ctx.fillStyle = "#ffd54f";
      bullets.forEach(b=> { ctx.beginPath(); ctx.arc(b.x,b.y,4,0,Math.PI*2); ctx.fill(); });
      // enemigos
      ctx.fillStyle = "#ff8c00";
      enemies.forEach(e=> { ctx.beginPath(); ctx.arc(e.x,e.y,e.r,0,Math.PI*2); ctx.fill(); });

      requestAnimationFrame(step);
    }

    startBtn?.addEventListener("click", ()=>{
      bullets.length = 0; enemies.length = 0; score = 0;
      player.x = W/2; player.y = H-50; running = true;
      if (scoreBox) scoreBox.textContent = "Puntos: 0";
      requestAnimationFrame(step);
    });

    // Mantén lógica de tamaño simple; visual responsive por CSS
    window.addEventListener("resize", () => {
      W = canvas.width; H = canvas.height;
    });
  }

  /* -------------------------------------------
   * Footer: año actual
   * ------------------------------------------- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
