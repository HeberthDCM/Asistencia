window.onload = function () {
  fetch('asistencias.xlsx')
    .then(res => res.arrayBuffer())
    .then(buffer => {
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
      renderTabs(data);
    });
};

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
    header.innerHTML = `<th>Estudiante</th>` +
      Array.from({ length: 5 }, (_, i) => `<th>Semana ${i + 1}</th>`).join('') +
      `<th>Total</th>`;

    estudiantes.forEach(est => {
      const row = table.insertRow();
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
            cell.innerHTML = '🟡';
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

    // Fila de totales por semana
    const totalRow = table.insertRow();
    const totalCell = totalRow.insertCell();
    totalCell.textContent = "Total por semana";
    totalCell.style.fontWeight = "bold";

    for (let semana = 1; semana <= 5; semana++) {
      let semanaTotal = cicloData.filter(d =>
        d.Semana == semana &&
        (d.Estado === 'asistencia' || d.Estado === 'recuperacion')
      ).length;

      const cell = totalRow.insertCell();
      cell.textContent = semanaTotal;
      cell.style.fontWeight = "bold";
    }

    totalRow.insertCell(); // celda vacía para columna "Total"

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
  header.innerHTML = `<th>Estudiante</th>` +
    Array.from({ length: 5 }, (_, i) => `<th>Ciclo ${i + 1}</th>`).join('') +
    `<th>Total General</th>`;

  let cicloSums = [0, 0, 0, 0, 0]; // Para consolidado por ciclo

  estudiantes.forEach(est => {
    const row = table.insertRow();
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

  // Fila de total por ciclo
  const totalRow = table.insertRow();
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

  // Activar primer tab
  document.querySelector('.tab-content > div').classList.add('active');
}
