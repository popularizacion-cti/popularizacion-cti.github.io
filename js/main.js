document.addEventListener('DOMContentLoaded', () => {
    const menuBtn = document.getElementById('menu-btn');
    const navLinks = document.querySelector('.nav-links');

    // Funcionalidad para desplegar el menú en dispositivos móviles
    menuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        
        // Cambiar icono del botón dependiendo si está abierto o cerrado
        if(navLinks.classList.contains('active')) {
            menuBtn.innerHTML = '✕'; // Botón de cerrar
        } else {
            menuBtn.innerHTML = '☰'; // Botón de menú hamburguesa
        }
    });
});
