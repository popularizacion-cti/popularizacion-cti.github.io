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

document.addEventListener('DOMContentLoaded', () => {
   
    const docID = '1fqyBmDhLSCFPXIQ8pnIOP7NUcULOdv2jreOPYUryZZ4'; // Solo el ID
    const urlGoogleSheet = `https://docs.google.com/spreadsheets/d/${docID}/export?format=csv`;
  
    const contenedorNoticias = document.getElementById('grid-noticias-dinamicas');

    function cargarNoticiasDesdeSheet() {
        if (!contenedorNoticias) return;
        
        contenedorNoticias.innerHTML = '<p>Consultando base de datos...</p>';

        // 2. Usamos PapaParse para leer tu Google Sheet
        Papa.parse(urlGoogleSheet, {
            download: true,
            header: true, // Esto convierte los encabezados en variables
            complete: async function(resultados) {
                const filas = resultados.data;
                contenedorNoticias.innerHTML = ''; // Limpiamos el texto de carga

                // 3. Recorremos cada fila de tu Excel
                for (const fila of filas) {
                    // Si la fila está vacía o no tiene enlace, la saltamos
                    if (!fila.ultima_noticia) continue; 

                    // Extraemos los datos de tus columnas
                    const urlAExtraer = fila.ultima_noticia;
                    const nombreMedio = fila.nombre || 'Noticia';
                    const colorMedio = fila.color || '#1e6c93';

                    // 4. Le pedimos a Microlink que lea ese enlace
                    const apiURL = `https://api.microlink.io?url=${encodeURIComponent(urlAExtraer)}`;

                    try {
                        const respuesta = await fetch(apiURL);
                        const json = await respuesta.json();
                        const datos = json.data;

                        // Si Microlink encuentra datos, los guardamos; si no, ponemos algo por defecto
                        const titulo = datos.title || 'Título no disponible';
                        const descripcion = datos.description || 'Visita el enlace para leer más detalles sobre esta noticia.';
                        const imagenUrl = datos.image?.url || 'assets/img/hero-bg.jpg';
                        const urlDestino = datos.url || urlAExtraer;

                        // 5. Construimos la tarjeta con el diseño que ya teníamos
                        const tarjetaHTML = `
                            <a href="${urlDestino}" target="_blank" rel="noopener noreferrer" class="card-link">
                                <article class="card">
                                    <div class="card-img" style="background-image: url('${imagenUrl}'); background-size: cover; background-position: center;"></div>
                                    <div class="card-content">
                                        <span class="tag" style="background-color: ${colorMedio}; color: white;">
                                            ${nombreMedio}
                                        </span>
                                        <h3>${titulo}</h3>
                                        <p>${descripcion.substring(0, 110)}...</p>
                                    </div>
                                </article>
                            </a>
                        `;

                        // Inyectamos la tarjeta en la página
                        contenedorNoticias.innerHTML += tarjetaHTML;

                    } catch (error) {
                        console.error("No se pudo cargar la vista previa de:", urlAExtraer, error);
                    }
                }
            }
        });
    }

    // Ejecutamos la función
    cargarNoticiasDesdeSheet();
});

/* 2.1. Efecto de inclinación 3D en tarjetas (imita holograma) */
const cards = document.querySelectorAll('.card');

cards.forEach(card => {
    card.addEventListener('mousemove', e => {
        let rect = card.getBoundingClientRect();
        let x = e.clientX - rect.left; // posición x dentro del elemento
        let y = e.clientY - rect.top;  // posición y dentro del elemento
        
        let xPercent = (x / rect.width - 0.5) * 20; // Inclinación máx 10deg
        let yPercent = (y / rect.height - 0.5) * -20;
        
        card.style.transform = `perspective(1000px) rotateX(${yPercent}deg) rotateY(${xPercent}deg)`;
    });
    
    card.addEventListener('mouseleave', e => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    });
});
