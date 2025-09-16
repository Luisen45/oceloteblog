document.addEventListener("DOMContentLoaded", () => {
  /* --- Nav toggle + smooth scroll (solo si hay anclas) --- */
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

  /* --- Flashcards simples (index) --- */
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

  /* --- Calculadora (index) --- */
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
        const res = Function("use strict";return (${expr}))();
        display.value = (res ?? "Error");
      }catch{ display.value = "Error"; }
    });
    clr && clr.addEventListener("click", () => display.value = "");
  }

  /* --- App de Estudio --- */
  const studyApp = document.getElementById("studyApp");
  if (studyApp) {
    const form = document.getElementById("addCardForm");
    const qInput = document.getElementById("qInput");
    const aInput = document.getElementById("aInput");
    const clearAll = document.getElementById("clearAll");
    const list = document.getElementById("cardList");

    const pc = document.getElementById("practiceCard");
    const pcQ = pc.querySelector(".pc-q");
    const pcA = pc.querySelector(".pc-a");
    const showAnswer = document.getElementById("showAnswer");
    const markRight = document.getElementById("markRight");
    const markWrong = document.getElementById("markWrong");
    const nextCard = document.getElementById("nextCard");
    const stats = document.getElementById("practiceStats");

    let cards = loadCards();
    let currentIndex = -1;
    let reveal = false;

    function loadCards(){
      try{
        return JSON.parse(localStorage.getItem("studyCards") || "[]");
      }catch{ return []; }
    }
    function saveCards(){
      localStorage.setItem("studyCards", JSON.stringify(cards));
    }

    function renderList(){
      list.innerHTML = "";
      if (cards.length === 0){
        list.innerHTML = <p class="muted">Aún no hay tarjetas.</p>;
        return;
      }
      cards.forEach((c, i) => {
        const row = document.createElement("div");
        row.className = "card-row";
        row.innerHTML = <div class="qa">
          <div class="q">${escapeHtml(c.q)}</div>
          <div class="a">${escapeHtml(c.a)}</div>
          <div class="muted small">Aciertos: ${c.right||0} / Intentos: ${c.attempts||0}</div>
        </div>
        <div class="act">
          <button class="btn ghost" data-edit="${i}" type="button">Editar</button>
          <button class="btn" data-del="${i}" type="button">Eliminar</button>
        </div>;
        list.appendChild(row);
      });

      list.querySelectorAll("[data-del]").forEach(b=>{
        b.addEventListener("click", ()=>{
          const i = +b.dataset.del;
          cards.splice(i,1);
          saveCards(); renderList();
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

    function pickCard(){
      if (cards.length===0){
        pcQ.textContent = "—"; pcA.textContent = "—"; stats.textContent = "Sin tarjetas.";
        return;
      }
      currentIndex = Math.floor(Math.random()*cards.length);
      pcQ.textContent = cards[currentIndex].q;
      pcA.textContent = "•••";
      reveal = false;
      updateStats();
    }
    function updateStats(){
      const totalAttempts = cards.reduce((s,c)=>s+(c.attempts||0),0);
      const totalRight = cards.reduce((s,c)=>s+(c.right||0),0);
      stats.textContent = Tarjetas: ${cards.length} · Intentos: ${totalAttempts} · Aciertos: ${totalRight};
    }

    form.addEventListener("submit", e=>{
      e.preventDefault();
      const q = qInput.value.trim();
      const a = aInput.value.trim();
      if (!q || !a) return;
      cards.push({q,a,attempts:0,right:0});
      saveCards(); renderList();
      qInput.value=""; aInput.value="";
      if (cards.length===1) pickCard();
    });

    clearAll.addEventListener("click", ()=>{
      if (confirm("¿Borrar todas las tarjetas?")){
        cards = []; saveCards(); renderList(); pickCard();
      }
    });

    showAnswer.addEventListener("click", ()=>{
      if (currentIndex<0) return;
      pcA.textContent = cards[currentIndex].a;
      reveal = true;
    });
    markRight.addEventListener("click", ()=>{
      if (currentIndex<0) return;
      cards[currentIndex].attempts = (cards[currentIndex].attempts||0)+1;
      cards[currentIndex].right = (cards[currentIndex].right||0)+1;
      saveCards(); renderList(); pickCard();
    });
    markWrong.addEventListener("click", ()=>{
      if (currentIndex<0) return;
      cards[currentIndex].attempts = (cards[currentIndex].attempts||0)+1;
      saveCards(); renderList(); pickCard();
    });
    nextCard.addEventListener("click", pickCard);

    function escapeHtml(s){ return s.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

    renderList(); pickCard();
  }

  /* --- Juego Dr Hermman (prototipo simple) --- */
  const canvas = document.getElementById("drGame");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    const startBtn = document.getElementById("startGame");
    const scoreBox = document.getElementById("scoreBox");

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
      const s = 1.2 + Math.random()*1.5;
      enemies.push({ x, y: -20, r: 12, dy: s });
      lastSpawn = t;
    }

    function step(t){
      if (!running) return;

      // move
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

      // collisions
      for (let i=enemies.length-1; i>=0; i--){
        const e = enemies[i];
        // hit player?
        const dxp = e.x - player.x, dyp = e.y - player.y;
        if (dxp*dxp + dyp*dyp < (e.r+player.r)*(e.r+player.r)){ // game over
          running = false;
          scoreBox.textContent = Puntos: ${score} · ¡Game Over!;
        }
        // bullets
        for (let j=bullets.length-1; j>=0; j--){
          const b = bullets[j];
          const dxb = e.x - b.x, dyb = e.y - b.y;
          if (dxb*dxb + dyb*dyb < (e.r+6)*(e.r+6)){
            enemies.splice(i,1); bullets.splice(j,1); score++;
            scoreBox.textContent = Puntos: ${score};
            break;
          }
        }
        if (e.y > H+30) enemies.splice(i,1);
      }

      // draw
      ctx.clearRect(0,0,W,H);
      // player
      ctx.fillStyle = "#6c5ce7";
      ctx.beginPath(); ctx.arc(player.x, player.y, player.r, 0, Math.PI*2); ctx.fill();
      // bullets
      ctx.fillStyle = "#ffd54f";
      bullets.forEach(b=> { ctx.beginPath(); ctx.arc(b.x,b.y,4,0,Math.PI*2); ctx.fill(); });
      // enemies
      ctx.fillStyle = "#ff8c00";
      enemies.forEach(e=> { ctx.beginPath(); ctx.arc(e.x,e.y,e.r,0,Math.PI*2); ctx.fill(); });

      requestAnimationFrame(step);
    }

    startBtn.addEventListener("click", ()=>{
      // reset
      bullets.length = 0; enemies.length = 0; score = 0;
      player.x = W/2; player.y = H-50; running = true;
      scoreBox.textContent = "Puntos: 0";
      requestAnimationFrame(step);
    });

    // Ajuste de tamaño en responsive (mantiene resolución del canvas)
    const resize = () => {
      // Visualmente ya es responsive por CSS; no cambiamos width/height internos
      // para mantener la lógica simple.
      W = canvas.width; H = canvas.height;
    };
    window.addEventListener("resize", resize);
  }

  /* --- Footer año --- */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});
