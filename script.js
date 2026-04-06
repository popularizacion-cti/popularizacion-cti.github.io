let slides = document.querySelectorAll(".slide");
let index = 0;
let timer; // Variable para guardar nuestro temporizador

function showSlide(newIndex) {
    // Ocultar la imagen actual
    slides[index].classList.remove("active");
    
    // Calcular el nuevo índice de forma cíclica
    if (newIndex >= slides.length) {
        index = 0; // Si pasa de la última, vuelve a la primera
    } else if (newIndex < 0) {
        index = slides.length - 1; // Si retrocede en la primera, va a la última
    } else {
        index = newIndex;
    }
    
    // Mostrar la nueva imagen
    slides[index].classList.add("active");
}

// Función que se activa al hacer clic en las flechas
function moveSlide(step) {
    showSlide(index + step);
    resetTimer(); // Reiniciamos el tiempo para que no cambie de golpe
}

// Función para el cambio automático
function autoPlay() {
    showSlide(index + 1);
}

// Reinicia el contador de 5 segundos
function resetTimer() {
    clearInterval(timer);
    timer = setInterval(autoPlay, 5000);
}

// Iniciar el carrusel automático la primera vez
timer = setInterval(autoPlay, 5000);
