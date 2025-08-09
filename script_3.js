// === CONFIGURA TUS IDS Y API KEY AQUÍ ===
const ASISTENCIAS_FILE_ID = '1mArFeb9Qnz8SBYeE-1gqtH_yPuGpQbwXFyDJV8VAFTg';
const PAGOS_FILE_ID = '1FrHbDkzWdI9azvVQQywSr2j8tB3V6PPF_3YAfXsP6Hg';
const GOOGLE_API_KEY = 'AIzaSyDIpQy54Q3Cp7Z54D5d90P1_x5L9OsVmMU';

// === FUNCIONES GENERALES ===
function loadExcelFromDrive(fileId, callback) {
  //const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${GOOGLE_API_KEY}`;
  //const url = `https://sheets.googleapis.com/v4/spreadsheets/${fileId}?alt=media&key=${GOOGLE_API_KEY}`;
  //https://sheets.googleapis.com/v4/spreadsheets/[SHEET_ID]/values/[RANGE]?key=[YOUR_API_KEY]
  const url = `https://docs.google.com/spreadsheets/d/${ASISTENCIAS_FILE_ID}/export?format=xlsx`;

  fetch(url)
    .then(res => res.arrayBuffer())
    .then(buffer => {
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet);
      callback(data);
    })
    .catch(err => {
      console.error("Error al cargar archivo de Google Drive:", err);
      alert("No se pudo cargar un archivo desde Drive. Verifica permisos y clave API.");
    });
}

// === FLUJO PRINCIPAL ===
window.onload = function () {
  loadExcelFromDrive(ASISTENCIAS_FILE_ID, asistenciaData => {
    renderTabs(asistenciaData);
    loadPagosTab(); // Solo cargamos pestaña de pagos una vez renderizadas las demás
  });
};

// === RENDER DE TABS PRINCIPALES ===
function renderTabs(data) {
  const tabs = document.getElementById('tabs');
  const content = document.getElementById('tabContent');

  const tabNames = ['Ciclo 1', 'Ciclo 2', 'Ciclo 3', 'Ciclo 4', 'Ciclo 5', 'Consolidado'];

  tabNames.forEach((name, i) => {
    const btn = document.createElement('button');
    btn.textContent = name;
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-content > div').forEach(div => div.classList.remove('active'));
      document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
      document.getElementById(`tab${i}`).classList.add('active');
      btn.classList.add('active');
    });
    if (i === 0) btn.classList.add('active');
    tabs.appendChild(btn);
  });

  // Ciclos 1 a 5
  for (let ciclo = 1; ciclo <= 5; ciclo++) {
    const cicloData = data.filter(d => d.Ciclo == ciclo);
    const estudiantes = [...new Set(cicloData.map(d => d.Nombre))];

    const div = document.createElement('div');
    div.id = `tab${ciclo - 1}`;
    div.className = ciclo === 1 ? 'active' : '';

    const table = document.createElement('table');
    const header = table.insertRow();
    header.innerHTML = `<th>#</th><th>Estudiante</th>` +
      Array.from({ length: 5 }, (_, i) => `<th>Semana ${i + 1}</th>`).join('') +
      `<th>Total</th>`;

    estudiantes.forEach((est, index) => {
      const row = table.insertRow();
      row.insertCell().textContent = index + 1;
      row.insertCell().textContent = est;
      let total = 0;

      for (let semana = 1; semana <= 5; semana++) {
        const record = cicloData.find(r => r.Nombre === est && r.Semana == semana);
        const cell = row.insertCell();
        if (record) {
          if (record.Estado === 'asistencia') {
            cell.innerHTML = '🟢';
            cell.className = 'flag-green';
            total++;
          } else if (record.Estado === 'falta') {
            cell.innerHTML = '❌';
            cell.className = 'x-green';
          } else if (record.Estado === 'recuperacion') {
            cell.innerHTML = '®️';
            cell.className = 'flag-yellow';
            total++;
          }
        } else {
          cell.textContent = '-';
        }
      }

      const totalCell = row.insertCell();
      totalCell.textContent = total;
    });

    // Totales por semana
    const totalRow = table.insertRow();
    totalRow.insertCell();
    totalRow.insertCell().textContent = "Total por semana";
    totalRow.cells[1].style.fontWeight = "bold";

    for (let semana = 1; semana <= 5; semana++) {
      let semanaTotal = cicloData.filter(d =>
        d.Semana == semana &&
        (d.Estado === 'asistencia' || d.Estado === 'recuperacion')
      ).length;

      const cell = totalRow.insertCell();
      cell.textContent = semanaTotal;
      cell.style.fontWeight = "bold";
    }

    totalRow.insertCell(); // columna "Total"

    div.appendChild(table);
    content.appendChild(div);
  }

  // Consolidado
  const divConsolidado = document.createElement('div');
  divConsolidado.id = 'tab5';
  divConsolidado.className = '';

  const estudiantes = [...new Set(data.map(d => d.Nombre))];
  const table = document.createElement('table');
  const header = table.insertRow();
  header.innerHTML = `<th>#</th><th>Estudiante</th>` +
    Array.from({ length: 5 }, (_, i) => `<th>Ciclo ${i + 1}</th>`).join('') +
    `<th>Total General</th>`;

  let cicloSums = [0, 0, 0, 0, 0];

  estudiantes.forEach((est, index) => {
    const row = table.insertRow();
    row.insertCell().textContent = index + 1;
    row.insertCell().textContent = est;

    let totalGeneral = 0;
    for (let ciclo = 1; ciclo <= 5; ciclo++) {
      const cicloData = data.filter(d => d.Ciclo == ciclo && d.Nombre === est);
      let total = 0;

      cicloData.forEach(d => {
        if (d.Estado === 'asistencia' || d.Estado === 'recuperacion') total++;
      });

      totalGeneral += total;
      cicloSums[ciclo - 1] += total;
      row.insertCell().textContent = total;
    }

    row.insertCell().textContent = totalGeneral;
  });

  const totalRow = table.insertRow();
  totalRow.insertCell();
  const labelCell = totalRow.insertCell();
  labelCell.textContent = "Total por ciclo";
  labelCell.style.fontWeight = "bold";

  let totalGeneral = 0;
  cicloSums.forEach(total => {
    const cell = totalRow.insertCell();
    cell.textContent = total;
    cell.style.fontWeight = "bold";
    totalGeneral += total;
  });

  const totalCell = totalRow.insertCell();
  totalCell.textContent = totalGeneral;
  totalCell.style.fontWeight = "bold";

  divConsolidado.appendChild(table);
  content.appendChild(divConsolidado);
}

// === PESTAÑA DE PAGOS ===
function loadPagosTab() {
  const tabs = document.getElementById('tabs');
  const content = document.getElementById('tabContent');

  const pagosBtn = document.createElement('button');
  pagosBtn.textContent = 'Pagos';
  tabs.appendChild(pagosBtn);

  pagosBtn.addEventListener('click', () => {
    document.querySelectorAll('.tab-content > div').forEach(div => div.classList.remove('active'));
    document.querySelectorAll('.tabs button').forEach(b => b.classList.remove('active'));
    document.getElementById('tab6').classList.add('active');
    pagosBtn.classList.add('active');
  });

  const pagosDiv = document.createElement('div');
  pagosDiv.id = 'tab6';
  pagosDiv.className = '';
  content.appendChild(pagosDiv);

  loadExcelFromDrivePago(PAGOS_FILE_ID, pagosData => {
    const estudiantes = [...new Set(pagosData.map(p => p.Nombre))];
    const table = document.createElement('table');
    const header = table.insertRow();
    header.innerHTML = `<th>#</th><th>Estudiante</th>` +
      Array.from({ length: 5 }, (_, i) => `<th>Ciclo ${i + 1}</th>`).join('');

    estudiantes.forEach((est, index) => {
      const row = table.insertRow();
      row.insertCell().textContent = index + 1;
      row.insertCell().textContent = est;

      for (let ciclo = 1; ciclo <= 5; ciclo++) {
        
        const record = pagosData.find(p => p.Nombre === est && p.Ciclo == ciclo);
        const cell = row.insertCell();

        if (record) {
          if (record.Estado.toLowerCase() === 'pagado') {
            cell.textContent = 'Pagado';
            cell.style.color = 'green';
            cell.style.fontWeight = 'bold';
            alert(`Pago registrado para ${est} en Ciclo ${ciclo}`);
          } else {
            cell.textContent = 'Sin pagar';
            cell.style.color = 'red';
            cell.style.fontWeight = 'bold';
            //alert(`Pago pendiente para ${est} en Ciclo ${ciclo}`);
          }
        } else {
          cell.textContent = '-';
          //alert(`No se encontró registro de pago para ${est} en Ciclo ${ciclo}`);
        }
      }
    });

    pagosDiv.appendChild(table);
  });
}
