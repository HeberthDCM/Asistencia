async function loadAsistenciasData(ciclo) {
    try {
        // Show loading state
        document.getElementById('resumenAsistencias').innerHTML = '<p>Cargando datos...</p>';
        document.getElementById('detalleAsistencias').innerHTML = '<p>Cargando datos...</p>';
        
        // Fetch the Excel file
        const response = await fetch('DATA/Asistencias.xlsx');
        if (!response.ok) {
            throw new Error('No se pudo cargar el archivo de asistencias');
        }
        
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Get the first sheet
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        
        if (jsonData.length === 0) {
            throw new Error('El archivo de asistencias está vacío');
        }
        
        // Generate tables
        generateResumenAsistencias(jsonData, ciclo);
        generateDetalleAsistencias(jsonData, ciclo);
        
    } catch (error) {
        console.error('Error al cargar datos de asistencias:', error);
        showError(`Error al cargar datos de asistencias: ${error.message}`, 'resumenAsistencias');
        showError(`Error al cargar datos de asistencias: ${error.message}`, 'detalleAsistencias');
    }
}

function generateResumenAsistencias(data, ciclo) {
    const container = document.getElementById('resumenAsistencias');
    
    if (ciclo === 'consolidado') {
        // Generate consolidated summary
        const summaryByCiclo = {};
        
        data.forEach(item => {
            if (!summaryByCiclo[item.ciclo]) {
                summaryByCiclo[item.ciclo] = {
                    total: 0,
                    asistio: 0,
                    recupero: 0,
                    falto: 0,
                    sinDictar: 0
                };
            }
            
            summaryByCiclo[item.ciclo].total++;
            
            switch(item.estado) {
                case 'asistio':
                    summaryByCiclo[item.ciclo].asistio++;
                    break;
                case 'recupero':
                    summaryByCiclo[item.ciclo].recupero++;
                    break;
                case 'falto':
                    summaryByCiclo[item.ciclo].falto++;
                    break;
                case 'sin dictar':
                    summaryByCiclo[item.ciclo].sinDictar++;
                    break;
            }
        });
        
        let html = '<h2>Resumen Consolidado de Asistencias</h2>';
        html += '<table><thead><tr><th>Ciclo</th><th>Total</th><th>Asistió</th><th>Recuperó</th><th>Faltó</th><th>Sin Dictar</th><th>% Asistencia</th></tr></thead><tbody>';
        
        Object.keys(summaryByCiclo).sort().forEach(ciclo => {
            const stats = summaryByCiclo[ciclo];
            const totalAsistencia = stats.asistio + stats.recupero;
            const porcentaje = (totalAsistencia / (stats.total - stats.sinDictar)) * 100;
            
            html += `<tr>
                <td>${ciclo}</td>
                <td>${stats.total}</td>
                <td>${stats.asistio}</td>
                <td>${stats.recupero}</td>
                <td>${stats.falto}</td>
                <td>${stats.sinDictar}</td>
                <td>${porcentaje.toFixed(2)}%</td>
            </tr>`;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    } else {
        // Generate weekly summary for a specific ciclo
        const summaryBySemana = {};
        
        data.forEach(item => {
            if (item.ciclo == ciclo) {
                if (!summaryBySemana[item.semana]) {
                    summaryBySemana[item.semana] = {
                        total: 0,
                        asistio: 0,
                        recupero: 0,
                        falto: 0,
                        sinDictar: 0
                    };
                }
                
                summaryBySemana[item.semana].total++;
                
                switch(item.estado) {
                    case 'asistio':
                        summaryBySemana[item.semana].asistio++;
                        break;
                    case 'recupero':
                        summaryBySemana[item.semana].recupero++;
                        break;
                    case 'falto':
                        summaryBySemana[item.semana].falto++;
                        break;
                    case 'sin dictar':
                        summaryBySemana[item.semana].sinDictar++;
                        break;
                }
            }
        });
        
        let html = `<h2>Resumen de Asistencias - Ciclo ${ciclo}</h2>`;
        html += '<table><thead><tr><th>Semana</th><th>Total</th><th>Asistió</th><th>Recuperó</th><th>Faltó</th><th>Sin Dictar</th><th>% Asistencia</th></tr></thead><tbody>';
        
        Object.keys(summaryBySemana).sort().forEach(semana => {
            const stats = summaryBySemana[semana];
            const totalAsistencia = stats.asistio + stats.recupero;
            const porcentaje = (totalAsistencia / (stats.total - stats.sinDictar)) * 100;
            
            html += `<tr>
                <td>${semana}</td>
                <td>${stats.total}</td>
                <td>${stats.asistio}</td>
                <td>${stats.recupero}</td>
                <td>${stats.falto}</td>
                <td>${stats.sinDictar}</td>
                <td>${porcentaje.toFixed(2)}%</td>
            </tr>`;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    }
}

function generateDetalleAsistencias(data, ciclo) {
    const container = document.getElementById('detalleAsistencias');
    
    if (ciclo === 'consolidado') {
        // Nueva tabla consolidada por estudiante y ciclo
        const studentStats = {};
        const ciclos = [...new Set(data.map(item => item.ciclo))].sort();
        
        data.forEach(item => {
            if (!studentStats[item.nombre]) {
                studentStats[item.nombre] = {
                    totalAsistencias: 0,
                    asistenciasPorCiclo: {}
                };
            }
            
            // Inicializar contador por ciclo si no existe
            if (!studentStats[item.nombre].asistenciasPorCiclo[item.ciclo]) {
                studentStats[item.nombre].asistenciasPorCiclo[item.ciclo] = 0;
            }
            
            // Contar solo asistencias y recuperaciones
            if (item.estado === 'asistio' || item.estado === 'recupero') {
                studentStats[item.nombre].asistenciasPorCiclo[item.ciclo]++;
                studentStats[item.nombre].totalAsistencias++;
            }
        });
        
        let html = '<h2>Consolidado de Asistencias por Estudiante</h2>';
        html += '<table><thead><tr><th>Estudiante</th>';
        
        // Encabezados de columnas por ciclo
        ciclos.forEach(c => {
            html += `<th>Ciclo ${c}</th>`;
        });
        
        html += '<th>Total Asistencias</th></tr></thead><tbody>';
        
        // Filas por estudiante
        Object.keys(studentStats).sort().forEach(nombre => {
            const stats = studentStats[nombre];
            html += `<tr><td>${nombre}</td>`;
            
            // Asistencias por ciclo
            ciclos.forEach(c => {
                const count = stats.asistenciasPorCiclo[c] || 0;
                html += `<td>${count}</td>`;
            });
            
            // Total de asistencias
            html += `<td>${stats.totalAsistencias}</td></tr>`;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    } else {
        // Tabla detallada por semana para ciclos específicos
        const students = {};
        const semanas = [...new Set(data.filter(item => item.ciclo == ciclo).map(item => item.semana))].sort();
        const nombres = [...new Set(data.filter(item => item.ciclo == ciclo).map(item => item.nombre))].sort();
        
        data.filter(item => item.ciclo == ciclo).forEach(item => {
            if (!students[item.nombre]) {
                students[item.nombre] = {};
            }
            students[item.nombre][item.semana] = item.estado;
        });
        
        let html = `<h2>Detalle de Asistencias - Ciclo ${ciclo}</h2>`;
        html += '<table><thead><tr><th>Estudiante</th>';
        
        // Add week headers
        semanas.forEach(semana => {
            html += `<th>Sem. ${semana}</th>`;
        });
        
        html += '<th>Total Asistencia</th></tr></thead><tbody>';
        
        // Add student rows
        nombres.forEach(nombre => {
            html += `<tr><td>${nombre}</td>`;
            let totalAsistencia = 0;
            let totalSemanas = 0;
            
            semanas.forEach(semana => {
                const estado = students[nombre][semana];
                
                if (estado === 'asistio') {
                    html += `<td class="asistio"><i class="fas fa-check"></i></td>`;
                    totalAsistencia++;
                    totalSemanas++;
                } else if (estado === 'recupero') {
                    html += `<td class="recupero"><i class="fas fa-flag"></i></td>`;
                    totalAsistencia++;
                    totalSemanas++;
                } else if (estado === 'falto') {
                    html += `<td class="falto"><i class="fas fa-times"></i></td>`;
                    totalSemanas++;
                } else if (estado === 'sin dictar') {
                    html += '<td></td>';
                } else {
                    html += '<td></td>';
                }
            });
            
            const porcentaje = totalSemanas > 0 ? (totalAsistencia / totalSemanas * 100) : 0;
            html += `<td>${porcentaje.toFixed(2)}%</td></tr>`;
        });
        
        html += '</tbody></table>';
        container.innerHTML = html;
    }
}
