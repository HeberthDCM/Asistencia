const API_KEY = 'AIzaSyDIpQy54Q3Cp7Z54D5d90P1_x5L9OsVmMU';
const asistenciaSheetID = '1mArFeb9Qnz8SBYeE-1gqtH_yPuGpQbwXFyDJV8VAFTg';
const pagosSheetID = '1FrHbDkzWdI9azvVQQywSr2j8tB3V6PPF_3YAfXsP6Hg';

document.addEventListener("DOMContentLoaded", () => {
  loadSidebar();
  loadAsistencias();
  loadPagos();
});

function showSection(id) {
  document.querySelectorAll(".content-section").forEach(sec => sec.style.display = "none");
  document.getElementById(id).style.display = "block";
}

function loadSidebar() {
  const sidebar = document.getElementById("sidebar");
  sidebar.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement("button");
    btn.textContent = `Ciclo ${i}`;
    btn.onclick = () => showAsistenciaCiclo(i);
    sidebar.appendChild(btn);
  }
}

async function fetchSheetData(sheetId, sheetName = '') {
  //const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}?key=${API_KEY}`;
  const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=xlsx`;
  const res = await fetch(url);
  const data = await res.json();
  const rows = data.values;
  const [headers, ...entries] = rows;
  return entries.map(row => Object.fromEntries(headers.map((h, i) => [h.toLowerCase(), row[i] || ''])));
}

let asistenciasData = [];

async function loadAsistencias() {
  asistenciasData = await fetchSheetData(asistenciaSheetID, 'asistencias');
  showAsistenciaCiclo(1); // Mostrar por defecto ciclo 1
}

function showAsistenciaCiclo(ciclo) {
  const section = document.getElementById("asistencias");
  const filtradas = asistenciasData.filter(r => r.ciclo == ciclo);
  const alumnos = [...new Set(filtradas.map(r => r.nombre))];
  const semanas = ["semana 1", "semana 2", "semana 3", "semana 4", "semana 5"];

  let html = `<h2>Asistencias - Ciclo ${ciclo}</h2><table><tr><th>Nombre</th>`;
  semanas.forEach(s => html += `<th>${s}</th>`);
  html += `<th>Total</th></tr>`;

  alumnos.forEach(nombre => {
    html += `<tr><td>${nombre}</td>`;
    let total = 0;
    semanas.forEach(semana => {
      const fila = filtradas.find(r => r.nombre === nombre && r.semana.toLowerCase() === semana.toLowerCase());
      let clase = 'sin-dictar', simbolo = '';
      if (fila) {
        if (fila.estado.toLowerCase() === 'asistio') {
          clase = 'asistio'; simbolo = '🏁'; total++;
        } else if (fila.estado.toLowerCase() === 'recupero') {
          clase = 'recupero'; simbolo = '🏁'; total++;
        } else if (fila.estado.toLowerCase() === 'falto') {
          clase = 'falto'; simbolo = '❌';
        }
      }
      html += `<td class="${clase}">${simbolo}</td>`;
    });
    html += `<td>${total}</td></tr>`;
  });

  // Total por semana
  html += `<tr><th>Total por semana</th>`;
  semanas.forEach(semana => {
    const total = filtradas.filter(r => r.semana.toLowerCase() === semana.toLowerCase() && ['asistio', 'recupero'].includes(r.estado.toLowerCase())).length;
    html += `<td>${total}</td>`;
  });
  html += `<td></td></tr>`;

  html += `</table>`;
  section.innerHTML = html;
}

async function loadPagos() {
  const pagos = await fetchSheetData(pagosSheetID, 'pagos');
  const section = document.getElementById("pagos");
  const alumnos = [...new Set(pagos.map(p => p.nombre))];

  let html = `<h2>Pagos</h2><table><tr><th>Nombre</th>`;
  for (let i = 1; i <= 5; i++) html += `<th>Ciclo ${i}</th>`;
  html += `</tr>`;

  alumnos.forEach(nombre => {
    html += `<tr><td>${nombre}</td>`;
    for (let i = 1; i <= 5; i++) {
      const fila = pagos.find(p => p.nombre === nombre && p.ciclo == i);
      let clase = 'sin-generar', texto = '';
      if (fila) {
        if (fila.estado.toLowerCase() === 'pagado') {
          clase = 'pagado'; texto = 'Pagado';
        } else if (fila.estado.toLowerCase() === 'pendiente') {
          clase = 'pendiente'; texto = 'Pendiente';
        }
      }
      html += `<td class="${clase}">${texto}</td>`;
    }
    html += `</tr>`;
  });

  html += `</table>`;
  section.innerHTML = html;
}
