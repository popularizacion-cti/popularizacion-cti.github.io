const SHEET_ID = "1KXmB725GOfa-ROh7L9MHNcgAT9KqXDFrwNGOZmAJe1s";
const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

let eventosGlobal = [];
let map;
let geoLayer;

async function cargarDatos() {

  const response = await fetch(URL);
  const text = await response.text();
  const json = JSON.parse(text.substr(47).slice(0, -2));

  eventosGlobal = json.table.rows.map(r => ({
    nombre: r.c[0]?.v,
    ciudad: r.c[1]?.v,
    region: r.c[2]?.v,
    ugel: r.c[3]?.v,
    fecha: r.c[4]?.v,
    institucion: r.c[5]?.v,
    lugar: r.c[6]?.v,
    alcance: r.c[7]?.v,
    descripcion: r.c[8]?.v,
    enlace: r.c[9]?.v,
    clubes: Number(r.c[10]?.v || 0),
    alumnos: Number(r.c[11]?.v || 0),
    docentes: Number(r.c[12]?.v || 0),
    modalidad: r.c[13]?.v
  }));

  inicializarMapa();
  cargarFiltros();
  actualizarVisualizacion();
}

function inicializarMapa() {
  map = L.map('map').setView([-9.19, -75.015], 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png')
    .addTo(map);

  fetch('peru-regiones.geojson')
    .then(res => res.json())
    .then(data => {
      geoLayer = L.geoJSON(data, {
        style: estiloRegion,
        onEachFeature: onEachRegion
      }).addTo(map);
    });
}

function estiloRegion(feature) {

  const region = feature.properties.NOMBDEP;
  const datos = calcularIndicadoresRegion(region);

  return {
    fillColor: escalaColor(datos.encuentros),
    weight: 1,
    color: "#444",
    fillOpacity: 0.7
  };
}

function escalaColor(valor) {
  return valor > 15 ? "#7A0008" :
         valor > 8  ? "#B5121B" :
         valor > 4  ? "#D62828" :
         valor > 1  ? "#F77F00" :
                      "#FFE5D9";
}

function onEachRegion(feature, layer) {

  const region = feature.properties.NOMBDEP;
  const datos = calcularIndicadoresRegion(region);

  layer.bindPopup(`
    <strong>${region}</strong><br>
    Encuentros: ${datos.encuentros}<br>
    Clubes: ${datos.clubes}<br>
    Participantes: ${datos.alumnos}<br>
    Docentes: ${datos.docentes}
  `);
}

function calcularIndicadoresRegion(region) {

  const filtrados = aplicarFiltrosDatos();

  const regionData = filtrados.filter(e => e.region === region);

  return {
    encuentros: regionData.length,
    clubes: regionData.reduce((a,b)=>a+b.clubes,0),
    alumnos: regionData.reduce((a,b)=>a+b.alumnos,0),
    docentes: regionData.reduce((a,b)=>a+b.docentes,0)
  };
}

function aplicarFiltrosDatos() {

  const anio = document.getElementById("filtroAnio").value;
  const region = document.getElementById("filtroRegion").value;
  const inst = document.getElementById("filtroInstitucion").value;
  const alcance = document.getElementById("filtroAlcance").value;

  return eventosGlobal.filter(e => {

    const anioMatch = !anio || e.fecha.startsWith(anio);
    const regionMatch = !region || e.region === region;
    const instMatch = !inst || e.institucion === inst;
    const alcanceMatch = !alcance || e.alcance === alcance;

    return anioMatch && regionMatch && instMatch && alcanceMatch;
  });
}

function actualizarVisualizacion() {
  if (geoLayer) {
    geoLayer.setStyle(estiloRegion);
  }
  actualizarIndicadoresGenerales();
  actualizarGrafico();
}


function actualizarIndicadoresGenerales() {

  const filtrados = aplicarFiltrosDatos();
  const regionesActivas = new Set(filtrados.map(e=>e.region));

  document.getElementById("kpiCobertura").innerHTML =
    `<strong>Cobertura territorial:</strong> ${regionesActivas.size} regiones`;

  document.getElementById("kpiIntensidad").innerHTML =
    `<strong>Total encuentros:</strong> ${filtrados.length}`;
}

function actualizarGrafico() {

  const porAnio = {};

  eventosGlobal.forEach(e=>{
    cconst anio = String(e.fecha).substring(0,4);
    porAnio[anio] = (porAnio[anio] || 0) + 1;
  });

  new Chart(document.getElementById("graficoCrecimiento"), {
    type: "line",
    data: {
      labels: Object.keys(porAnio),
      datasets: [{
        label: "Crecimiento anual nacional",
        data: Object.values(porAnio)
      }]
    }
  });
}

function cargarFiltros() {

  const anios = [...new Set(eventosGlobal.map(e=>e.fecha.substring(0,4)))];
  const regiones = [...new Set(eventosGlobal.map(e=>e.region))];
  const instituciones = [...new Set(eventosGlobal.map(e=>e.institucion))];
  const alcances = [...new Set(eventosGlobal.map(e=>e.alcance))];

  llenarSelect("filtroAnio", anios);
  llenarSelect("filtroRegion", regiones);
  llenarSelect("filtroInstitucion", instituciones);
  llenarSelect("filtroAlcance", alcances);

  document.querySelectorAll("select").forEach(s=>{
    s.addEventListener("change", actualizarVisualizacion);
  });
}

function llenarSelect(id, datos) {
  const select = document.getElementById(id);
  select.innerHTML = `<option value="">Todos</option>`;
  datos.forEach(d=>{
    select.innerHTML += `<option value="${d}">${d}</option>`;
  });
}

cargarDatos();
