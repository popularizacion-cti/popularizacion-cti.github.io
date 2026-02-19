var map = L.map('map').setView([-9.19, -75.015], 6);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap'
}).addTo(map);

var markers = L.markerClusterGroup();
var eventosGlobal = [];

fetch('eventos.json')
  .then(response => response.json())
  .then(data => {
    eventosGlobal = data;
    cargarFiltros(data);
    mostrarEventos(data);
  });

function cargarFiltros(data) {
  const meses = new Set();
  const regiones = new Set();

  data.forEach(e => {
    meses.add(e.fecha.substring(5,7));
    regiones.add(e.region);
  });

  const selectMes = document.getElementById('filtroMes');
  meses.forEach(m => {
    selectMes.innerHTML += `<option value="${m}">${m}</option>`;
  });

  const selectRegion = document.getElementById('filtroRegion');
  regiones.forEach(r => {
    selectRegion.innerHTML += `<option value="${r}">${r}</option>`;
  });

  selectMes.addEventListener('change', aplicarFiltros);
  selectRegion.addEventListener('change', aplicarFiltros);
}

function aplicarFiltros() {
  const mes = document.getElementById('filtroMes').value;
  const region = document.getElementById('filtroRegion').value;

  const filtrados = eventosGlobal.filter(e => {
    const coincideMes = mes === "todos" || e.fecha.substring(5,7) === mes;
    const coincideRegion = region === "todas" || e.region === region;
    return coincideMes && coincideRegion;
  });

  mostrarEventos(filtrados);
}

function mostrarEventos(eventos) {
  markers.clearLayers();
  document.getElementById('listaEventos').innerHTML = "";

  eventos.forEach(e => {

    var marker = L.marker([e.lat, e.lng])
      .bindPopup(`<b>${e.nombre}</b><br>${e.ciudad}<br>${e.fecha}`);

    markers.addLayer(marker);

    document.getElementById('listaEventos').innerHTML += `
      <div class="event-item">
        <b>${e.nombre}</b><br>
        ${e.ciudad} - ${e.fecha}
      </div>`;
  });

  map.addLayer(markers);
}
