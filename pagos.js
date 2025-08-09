async function loadPagosData() {
    try {
        // Show loading state
        document.getElementById('resumenPagos').innerHTML = '<p>Cargando datos...</p>';
        document.getElementById('detallePagos').innerHTML = '<p>Cargando datos...</p>';
        
        // Fetch the Excel file
        const response = await fetch('DATA/Pagos.xlsx');
        if (!response.ok) {
            throw new Error('No se pudo cargar el archivo de pagos');
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        if (jsonData.length === 0) {
            throw new Error('El archivo de pagos está vacío');
        }
        
        // Generate tables
        generateResumenPagos(jsonData);
        generateDetallePagos(jsonData);
        
    } catch (error) {
        console.error('Error al cargar datos de pagos:', error);
        showError(`Error al cargar datos de pagos: ${error.message}`, 'resumenPagos');
        showError(`Error al cargar datos de pagos: ${error.message}`, 'detallePagos');
    }
}

function generateResumenPagos(data) {
    const container = document.getElementById('resumenPagos');
    
    const summaryByCiclo = {};
    const students = new Set();
    
    data.forEach(item => {
        students.add(item.nombre);
        
        if (!summaryByCiclo[item.ciclo]) {
            summaryByCiclo[item.ciclo] = {
                total: 0,
                pagado: 0,
                pendiente: 0,
                retirado: 0,
                sinGenerar: 0
            };
        }
        
        summaryByCiclo[item.ciclo].total++;
        
        switch(item.estado) {
            case 'pagado':
                summaryByCiclo[item.ciclo].pagado++;
                break;
            case 'pendiente':
                summaryByCiclo[item.ciclo].pendiente++;
                break;
            case 'retirado':
                summaryByCiclo[item.ciclo].retirado++;
                break;
            case 'sin generar':
                summaryByCiclo[item.ciclo].sinGenerar++;
                break;
        }
    });
    
    let html = '<h2>Resumen de Pagos</h2>';
    html += '<table><thead><tr><th>Ciclo</th><th>Total</th><th>Pagado</th><th>Pendiente</th><th>Retirado</th><th>Sin Generar</th><th>% Pagado</th></tr></thead><tbody>';
    
    Object.keys(summaryByCiclo).sort().forEach(ciclo => {
        const stats = summaryByCiclo[ciclo];
        const porcentaje = (stats.pagado / (stats.total - stats.sinGenerar)) * 100;
        
        html += `<tr>
            <td>${ciclo}</td>
            <td>${stats.total}</td>
            <td>${stats.pagado}</td>
            <td>${stats.pendiente}</td>
            <td>${stats.retirado}</td>
            <td>${stats.sinGenerar}</td>
            <td>${porcentaje.toFixed(2)}%</td>
        </tr>`;
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

function generateDetallePagos(data) {
    const container = document.getElementById('detallePagos');
    
    const students = {};
    const ciclos = [...new Set(data.map(item => item.ciclo))].sort();
    
    data.forEach(item => {
        if (!students[item.nombre]) {
            students[item.nombre] = {
                estados: {},
                pagados: 0
            };
        }
        students[item.nombre].estados[item.ciclo] = item.estado;
        
        // Contar cuotas pagadas
        if (item.estado === 'pagado') {
            students[item.nombre].pagados++;
        }
    });
    
    let html = '<h2>Detalle de Pagos por Estudiante</h2>';
    html += '<table><thead><tr><th>Estudiante</th>';
    
    // Add ciclo headers
    ciclos.forEach(ciclo => {
        html += `<th>Ciclo ${ciclo}</th>`;
    });
    
    html += '<th>Cuotas Pagadas</th><th>% Pagado</th></tr></thead><tbody>';
    
    // Add student rows
    Object.keys(students).sort().forEach(nombre => {
        const studentData = students[nombre];
        html += `<tr><td>${nombre}</td>`;
        
        let totalCiclos = 0;
        let ciclosValidos = 0;
        
        ciclos.forEach(ciclo => {
            const estado = studentData.estados[ciclo];
            totalCiclos++;
            
            if (estado === 'pagado') {
                html += `<td class="pagado"><i class="fas fa-check"></i> Pagado</td>`;
                ciclosValidos++;
            } else if (estado === 'pendiente') {
                html += `<td class="pendiente"><i class="fas fa-exclamation-circle"></i> Pendiente</td>`;
                ciclosValidos++;
            } else if (estado === 'retirado') {
                html += `<td class="retirado"><i class="fas fa-times"></i> Retirado</td>`;
            } else if (estado === 'sin generar') {
                html += '<td class="sin-generar"></td>';
            } else {
                html += '<td class="sin-generar"></td>';
            }
        });
        
        // Calcular porcentaje de pago (excluyendo "sin generar" y "retirado")
        const porcentajePago = ciclosValidos > 0 ? 
            (studentData.pagados / ciclosValidos * 100) : 0;
        
        // Mostrar cuotas pagadas y porcentaje
        html += `<td>${studentData.pagados} / 5</td>`;
        html += `<td>${porcentajePago.toFixed(2)}%</td>`;
        
        html += '</tr>';
    });
    
    html += '</tbody></table>';
    container.innerHTML = html;
}

// Load pagos data when the section is shown
document.addEventListener('DOMContentLoaded', function() {
    const pagosNavItem = document.querySelector('.nav-item[data-section="pagos"]');
    
    pagosNavItem.addEventListener('click', function() {
        loadPagosData();
    });
});