const API_KEY = 'AIzaSyDIpQy54Q3Cp7Z54D5d90P1_x5L9OsVmMU';
const ASISTENCIAS_ID = '1jHc3q5_FBbCD98ShT2mwCXpRL7ayCbORo427zgHKF9Y';
const PAGOS_ID = '1HVkBsHbQQyd8o0pzkdXq18CVXyuRNutL-AzSmaxPG2Y';

function showSection(section) {
  document.getElementById('sidebar').classList.toggle('hidden', section !== 'asistencia');
  document.getElementById('mainContent').innerHTML = 'Cargando...';

  if (section === 'asistencia') {
    loadCiclos();
  } else if (section === 'pagos') {
    loadPagos();
  }
}

function loadCiclos() {
  const sidebar = document.getElementById('cicloMenu');
  sidebar.innerHTML = '';
  for (let i = 1; i <= 5; i++) {
    const li = document.createElement('li');
    li.innerHTML = `<button onclick="loadAsistencia(${i})">Ciclo ${i}</button>`;
    sidebar.appendChild(li);
  }
}

function loadAsistencia(ciclo) {
  fetchSheet(ASISTENCIAS_ID)
    .then(data => {
      const headers = data[0];
      const registros = data.slice(1).filter(row => row[1] === `Ciclo ${ciclo}`);
      const estudiantes = {};

      registros.forEach(row => {
        const [nombre, , semana, estado] = row;
        if (!estudiantes[nombre]) estudiantes[nombre] = {};
        estudiantes[nombre][semana] = estado;
      });

      const semanas = ['Semana 1', 'Semana 2', 'Semana 3', 'Semana 4', 'Examen'];
      let html = `<h2>Asistencia - Ciclo ${ciclo}</h2><table><tr><th>Nombre</th>`;

      semanas.forEach(s => html += `<th>${s}</th>`);
      html += `<th>Total</th></tr>`;

      for (const [nombre, asistencias] of Object.entries(estudiantes)) {
        let total = 0;
        html += `<tr><td>${nombre}</td>`;
        semanas.forEach(sem => {
          const estado = asistencias[sem] || '';
          if (estado === 'asistio') {
            html += `<td class="green">✅</td>`;
            total++;
          } else if (estado === 'recupero') {
            html += `<td class="yellow">⚠️</td>`;
            total++;
          } else if (estado === 'falto') {
            html += `<td class="red">❌</td>`;
          } else {
            html += `<td class="blank"></td>`;
          }
        });
        html += `<td>${total}</td></tr>`;
      }

      html += `</table>`;
      document.getElementById('mainContent').innerHTML = html;
    })
    .catch(error => {
      document.getElementById('mainContent').innerHTML = `<p style="color:red;">Error al cargar asistencias: ${error.message}</p>`;
    });
}

function mostrarConsolidado() {
  fetchSheet(ASISTENCIAS_ID)
    .then(data => {
      const registros = data.slice(1);
      const estudiantes = {};

      registros.forEach(row => {
        const [nombre, ciclo, , estado] = row;
        if (!estudiantes[nombre]) estudiantes[nombre] = {};
        if (!estudiantes[nombre][ciclo]) estudiantes[nombre][ciclo] = 0;
        if (estado === 'asistio' || estado === 'recupero') estudiantes[nombre][ciclo]++;
      });

      let html = `<h2>Asistencia Consolidada</h2><table><tr><th>Nombre</th>`;
      for (let i = 1; i <= 5; i++) html += `<th>Ciclo ${i}</th>`;
      html += `</tr>`;

      for (const [nombre, ciclos] of Object.entries(estudiantes)) {
        html += `<tr><td>${nombre}</td>`;
        for (let i = 1; i <= 5; i++) {
          html += `<td>${ciclos[`Ciclo ${i}`] || 0}</td>`;
        }
        html += `</tr>`;
      }

      html += `</table>`;
      document.getElementById('mainContent').innerHTML = html;
    })
    .catch(error => {
      document.getElementById('mainContent').innerHTML = `<p style="color:red;">Error al cargar consolidado: ${error.message}</p>`;
    });
}

function loadPagos() {
  fetchSheet(PAGOS_ID)
    .then(data => {
      const registros = data.slice(1);
      const estudiantes = {};

      registros.forEach(row => {
        const [nombre, ciclo, estado] = row;
        if (!estudiantes[nombre]) estudiantes[nombre] = {};
        estudiantes[nombre][ciclo] = estado;
      });

      let html = `<h2>Pagos</h2><table><tr><th>Nombre</th>`;
      for (let i = 1; i <= 5; i++) html += `<th>Ciclo ${i}</th>`;
      html += `</tr>`;

      for (const [nombre, ciclos] of Object.entries(estudiantes)) {
        html += `<tr><td>${nombre}</td>`;
        for (let i = 1; i <= 5; i++) {
          const estado = ciclos[`Ciclo ${i}`] || '';
          if (estado === 'pagado') {
            html += `<td class="green">Pagado</td>`;
          } else if (estado === 'pendiente') {
            html += `<td class="yellow">Pendiente</td>`;
          } else {
            html += `<td class="blank"></td>`;
          }
        }
        html += `</tr>`;
      }

      html += `</table>`;
      document.getElementById('mainContent').innerHTML = html;
    })
    .catch(error => {
      document.getElementById('mainContent').innerHTML = `<p style="color:red;">Error al cargar pagos: ${error.message}</p>`;
    });
}

function fetchSheet(sheetId) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/A1:Z1000?key=${API_KEY}`;
  return fetch(url)
    .then(res => {
      if (!res.ok) throw new Error('No se pudo conectar con Google Sheets');
      return res.json();
    })
    .then(json => json.values);
}
