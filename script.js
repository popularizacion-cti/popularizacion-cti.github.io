const SHEET_ID = "1KXmB725GOfa-ROh7L9MHNcgAT9KqXDFrwNGOZmAJe1s";
const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

let eventosGlobal = [];
let map;
let geoLayer;
let grafico;

async function cargarDatos() {

  const response = await fetch(URL);
  const text = await response.text();

  const json = JSON.parse(
    text.substring(
      text.indexOf("{"),
      text.lastIndexOf("}") + 1
    )
  );

  eventosGlobal = json.table.rows.map(r => ({
    nombre: r.c[0]?.v || "",
    ciudad: r.c[1]?.v || "",
    region: r.c[2]?.v || "",
    ugel: r.c[3]?.v || "",
    mes: r.c[4]?.v || "",
    anio: String(r.c[5]?.v || ""),
    institucion: r.c[6]?.v || "",
    lugar: r.c[7]?.v || "",
    alcance: r.c[8]?.v || "",
    descripcion: r.c[9]?.v || "",
    enlace: r.c[10]?.v || "",
    clubes: Number(r.c[11]?.v || 0),
    alumnos: Number(r.c[12]?.v || 0),
    docentes: Number(r.c[13]?.v || 0),
    modalidad: r.c[14]?.v || ""
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

function aplicarFiltros() {

  const anio = document.getElementById("filtroAnio").value;
  const region = document.getElementById("filtroRegion").value;
  const inst = document.getElementById("filtroInstitucion").value;
  const alcance = document.getElementById("filtroAlcance").value;

  return eventosGlobal.filter(e =>
    (!anio || e.anio === anio) &&
    (!region || e.region === region) &&
    (!inst || e.institucion === inst) &&
    (!alcance || e.alcance === alcance)
  );
}

function estiloRegion(feature) {

  const regionNombre = String(feature.properties.NOMBDEP).toUpperCase();
  const filtrados = aplicarFiltros();
  const cantidad = filtrados.filter(e => e.region === regionNombre).length;

  return {
    fillColor: escalaColor(cantidad),
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

  const regionNombre = String(feature.properties.NOMBDEP).toUpperCase();
  const filtrados = aplicarFiltros().filter(e =>
  e.region.toUpperCase() === regionNombre
  );

  const totalEncuentros = filtrados.length;
  const totalClubes = filtrados.reduce((a,b)=>a+b.clubes,0);
  const totalAlumnos = filtrados.reduce((a,b)=>a+b.alumnos,0);

  layer.bindPopup(`
    <strong>${regionNombre}</strong><br>
    Encuentros: ${totalEncuentros}<br>
    Clubes: ${totalClubes}<br>
    Participantes: ${totalAlumnos}
  `);
}

function actualizarVisualizacion() {
  if (geoLayer) geoLayer.setStyle(estiloRegion);
  actualizarIndicadores();
  actualizarGrafico();
}

function actualizarIndicadores() {

  const filtrados = aplicarFiltros();
  const regionesActivas = new Set(filtrados.map(e=>e.region));

  document.getElementById("kpiCobertura").innerHTML =
    `<strong>Cobertura territorial:</strong> ${regionesActivas.size} regiones`;

  document.getElementById("kpiTotal").innerHTML =
    `<strong>Total encuentros:</strong> ${filtrados.length}`;
}

function actualizarGrafico() {

  const porAnio = {};
  eventosGlobal.forEach(e=>{
    porAnio[e.anio] = (porAnio[e.anio] || 0) + 1;
  });

  if (grafico) grafico.destroy();

  grafico = new Chart(document.getElementById("graficoCrecimiento"), {
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

  llenarSelect("filtroAnio", [...new Set(eventosGlobal.map(e=>e.anio))]);
  llenarSelect("filtroRegion", [...new Set(eventosGlobal.map(e=>e.region))]);
  llenarSelect("filtroInstitucion", [...new Set(eventosGlobal.map(e=>e.institucion))]);
  llenarSelect("filtroAlcance", [...new Set(eventosGlobal.map(e=>e.alcance))]);

  document.querySelectorAll("select").forEach(s=>{
    s.addEventListener("change", actualizarVisualizacion);
  });
}

function llenarSelect(id, datos) {
  const select = document.getElementById(id);
  select.innerHTML = `<option value="">Todos</option>`;
  datos.filter(Boolean).forEach(d=>{
    select.innerHTML += `<option value="${d}">${d}</option>`;
  });
}

cargarDatos();
