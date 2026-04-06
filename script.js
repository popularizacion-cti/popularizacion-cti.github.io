let slides = document.querySelectorAll(".slide");
let index = 0;

function showSlides() {
    slides[index].classList.remove("active"); // Oculta la actual
    index = (index + 1) % slides.length;      // Calcula la siguiente de forma cíclica
    slides[index].classList.add("active");    // Muestra la nueva
}

// Cambia de imagen cada 5 segundos
setInterval(showSlides, 5000);
