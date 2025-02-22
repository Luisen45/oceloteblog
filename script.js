/* script.js */

/* -------------------------------------------------------
   Lógica para Flashcards:
   - Al hacer clic en cada tarjeta, se muestra/oculta la respuesta
-------------------------------------------------------- */
const flashcards = document.querySelectorAll('.flashcard');
flashcards.forEach(card => {
  card.addEventListener('click', () => {
    const answer = card.querySelector('.answer');
    // Si la respuesta está oculta, la mostramos; si está visible, la ocultamos
    if (answer.style.display === 'none' || answer.style.display === '') {
      answer.style.display = 'block';
    } else {
      answer.style.display = 'none';
    }
  });
});

/* -------------------------------------------------------
   Lógica para la Calculadora:
   - appendValue(value): Agrega dígitos u operadores al display
   - calculate(): Evalúa la expresión
   - clearDisplay(): Limpia el display
-------------------------------------------------------- */
const display = document.getElementById('display');

function appendValue(value) {
  display.value += value;
}

function calculate() {
  try {
    display.value = eval(display.value);
  } catch (error) {
    display.value = 'Error';
  }
}

function clearDisplay() {
  display.value = '';
}

/* -------------------------------------------------------
   Smooth Scrolling (opcional):
   - Desplazamiento suave al hacer clic en los enlaces del menú
-------------------------------------------------------- */
const navLinks = document.querySelectorAll('.nav-menu li a');
navLinks.forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    const targetId = link.getAttribute('href').substring(1);
    const targetSection = document.getElementById(targetId);

    if (targetSection) {
      window.scrollTo({
        top: targetSection.offsetTop - 50, // Ajuste según la altura del nav
        behavior: 'smooth'
      });
    }

    // Cierra el menú al hacer clic en un enlace (en mobile)
    mobileMenu.classList.remove('is-active');
    navMenu.classList.remove('active');
  });
});

/* -------------------------------------------------------
   Toggle menú hamburguesa en dispositivos móviles
-------------------------------------------------------- */
const mobileMenu = document.getElementById('mobile-menu');
const navMenu = document.querySelector('.nav-menu');

mobileMenu.addEventListener('click', () => {
  mobileMenu.classList.toggle('is-active');
  navMenu.classList.toggle('active');
});
