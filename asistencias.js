// Datos de ejemplo (simulando la carga desde Google Drive)
let datosAsistencias = [];

// Función para cargar datos de asistencias
function cargarDatosAsistencias() {
    try {
        // Simulación de carga de datos desde Google Drive
        // En una implementación real, aquí iría la llamada a la API de Google Drive
        console.log("Intentando cargar datos de asistencias...");
        
        // Datos de ejemplo
        datosAsistencias = [
            { nombre: "Juan Pérez", ciclo: "1", semana: "1", estado: "asistio" },
            { nombre: "Juan Pérez", ciclo: "1", semana: "2", estado: "recupero" },
            { nombre: "Juan Pérez", ciclo: "1", semana: "3", estado: "falto" },
            { nombre: "Juan Pérez", ciclo: "1", semana: "4", estado: "asistio" },
            { nombre: "Juan Pérez", ciclo: "2", semana: "1", estado: "asistio" },
            { nombre: "Juan Pérez", ciclo: "2", semana: "2", estado: "asistio" },
            { nombre: "Juan Pérez", ciclo: "2", semana: "3", estado: "recupero" },
            { nombre: "Juan Pérez", ciclo: "2", semana: "4", estado: "asistio" },
            { nombre: "María Gómez", ciclo: "1", semana: "1", estado: "asistio" },
            { nombre: "María Gómez", ciclo: "1", semana: "2", estado: "asistio" },
            { nombre: "María Gómez", ciclo: "1", semana: "3", estado: "asistio" },
            { nombre: "María Gómez", ciclo: "1", semana: "4", estado: "falto" },
            { nombre: "María Gómez", ciclo: "2", semana: "1", estado: "asistio" },
            { nombre: "María Gómez", ciclo: "2", semana: "2", estado: "recupero" },
            { nombre: "María Gómez", ciclo: "2", semana: "3", estado: "asistio" },
            { nombre: "María Gómez", ciclo: "2", semana: "4", estado: "asistio" },
            { nombre: "Carlos Ruiz", ciclo: "1", semana: "1", estado: "asistio" },
            { nombre: "Carlos Ruiz", ciclo: "1", semana: "2", estado: "falto" },
            { nombre: "Carlos Ruiz", ciclo: "1", semana: "3", estado: "falto" },
            { nombre: "Carlos Ruiz", ciclo: "1", semana: "4", estado: "recupero" },
            { nombre: "Carlos Ruiz", ciclo: "2", semana: "1", estado: "asistio" },
            { nombre: "Carlos Ruiz", ciclo: "2", semana: "2", estado: "asistio" },
            { nombre: "Carlos Ruiz", ciclo: "2", semana: "3", estado: "falto" },
            { nombre: "Carlos Ruiz", ciclo: "2", semana: "4", estado: "asistio" }
        ];
        
        console.log("Datos de asistencias cargados correctamente");
        
        // Mostrar asistencias consolidadas por defecto
        mostrarAsistenciasConsolidadas();
    } catch (error) {
        console.error("Error al cargar datos de asistencias:", error);
        mostrarErrorAsistencias("Error al cargar los datos de asistencias. Por favor, intente nuevamente.");
    }
}

// Función para mostrar error en el módulo de asistencias
function mostrarErrorAsistencias(mensaje) {
    const contentArea = document.getElementById('tabla-asistencias');
    contentArea.innerHTML = `<div class="error-message">${mensaje}</div>`;
}

// Función para mostrar asistencias consolidadas
function mostrarAsistenciasConsolidadas() {
    try {
        const contentArea = document.getElementById('tabla-asistencias');
        const resumenArea = document.getElementById('resumen-asistencias');
        
        // Procesar datos para resumen
        const resumen = calcularResumenAsistencias();
        
        // Generar HTML para el resumen
        let resumenHTML = `<h2>Resumen de Asistencias</h2><table><tr><th>Ciclo</th><th>Semana 1</th><th>Semana 2</th><th>Semana 3</th><th>Semana 4</th><th>Total Asistencias</th><th>Total Faltas</th></tr>`;
        
        for (let ciclo = 1; ciclo <= 5; ciclo++) {
            const cicloData = resumen.find(r => r.ciclo === ciclo.toString()) || { 
                ciclo: ciclo.toString(), 
                semanas: { '1': { asistio: 0, falto: 0 }, '2': { asistio: 0, falto: 0 }, '3': { asistio: 0, falto: 0 }, '4': { asistio: 0, falto: 0 } },
                totalAsistencias: 0,
                totalFaltas: 0
            };
            
            resumenHTML += `<tr>
                <td>Ciclo ${ciclo}</td>
                <td>${cicloData.semanas['1'].asistio} / ${cicloData.semanas['1'].asistio + cicloData.semanas['1'].falto}</td>
                <td>${cicloData.semanas['2'].asistio} / ${cicloData.semanas['2'].asistio + cicloData.semanas['2'].falto}</td>
                <td>${cicloData.semanas['3'].asistio} / ${cicloData.semanas['3'].asistio + cicloData.semanas['3'].falto}</td>
                <td>${cicloData.semanas['4'].asistio} / ${cicloData.semanas['4'].asistio + cicloData.semanas['4'].falto}</td>
                <td>${cicloData.totalAsistencias}</td>
                <td>${cicloData.totalFaltas}</td>
            </tr>`;
        }
        
        resumenHTML += `</table>`;
        resumenArea.innerHTML = resumenHTML;
        
        // Procesar datos para tabla consolidada
        const estudiantes = [...new Set(datosAsistencias.map(item => item.nombre))];
        const ciclos = ['1', '2', '3', '4', '5'];
        
        let html = `<h2>Asistencia Consolidada por Estudiante</h2><table><tr><th>Estudiante</th>`;
        
        // Encabezados de ciclos
        ciclos.forEach(ciclo => {
            html += `<th>Ciclo ${ciclo}</th>`;
        });
        
        html += `<th>Total</th></tr>`;
        
        // Filas por estudiante
        estudiantes.forEach(estudiante => {
            html += `<tr><td>${estudiante}</td>`;
            let totalAsistencias = 0;
            
            ciclos.forEach(ciclo => {
                const asistenciasCiclo = datosAsistencias.filter(
                    item => item.nombre === estudiante && item.ciclo === ciclo && (item.estado === 'asistio' || item.estado === 'recupero')
                ).length;
                
                const faltasCiclo = datosAsistencias.filter(
                    item => item.nombre === estudiante && item.ciclo === ciclo && item.estado === 'falto'
                ).length;
                
                const totalSemanas = 4; // 4 semanas por ciclo
                const asistenciaTexto = `${asistenciasCiclo}/${totalSemanas}`;
                
                // Determinar color de fondo según porcentaje de asistencia
                const porcentaje = (asistenciasCiclo / totalSemanas) * 100;
                let colorClass = '';
                
                if (porcentaje >= 80) {
                    colorClass = 'asistio';
                } else if (porcentaje >= 60) {
                    colorClass = 'recupero';
                } else if (asistenciasCiclo === 0 && faltasCiclo === 0) {
                    // Sin datos
                    colorClass = 'sin-dictar';
                } else {
                    colorClass = 'falto';
                }
                
                html += `<td class="${colorClass}">${asistenciaTexto}</td>`;
                totalAsistencias += asistenciasCiclo;
            });
            
            html += `<td>${totalAsistencias}/${ciclos.length * 4}</td></tr>`;
        });
        
        html += `</table>`;
        contentArea.innerHTML = html;
    } catch (error) {
        console.error("Error al mostrar asistencias consolidadas:", error);
        mostrarErrorAsistencias("Error al generar la vista de asistencias consolidadas.");
    }
}

// Función para calcular resumen de asistencias
function calcularResumenAsistencias() {
    const resumen = [];
    
    // Agrupar por ciclo y semana
    for (let ciclo = 1; ciclo <= 5; ciclo++) {
        const cicloStr = ciclo.toString();
        const cicloData = {
            ciclo: cicloStr,
            semanas: {
                '1': { asistio: 0, falto: 0 },
                '2': { asistio: 0, falto: 0 },
                '3': { asistio: 0, falto: 0 },
                '4': { asistio: 0, falto: 0 }
            },
            totalAsistencias: 0,
            totalFaltas: 0
        };
        
        // Filtrar datos para este ciclo
        const datosCiclo = datosAsistencias.filter(item => item.ciclo === cicloStr);
        
        // Procesar cada semana
        for (let semana = 1; semana <= 4; semana++) {
            const semanaStr = semana.toString();
            const datosSemana = datosCiclo.filter(item => item.semana === semanaStr);
            
            // Contar asistencias y faltas
            const asistio = datosSemana.filter(item => item.estado === 'asistio' || item.estado === 'recupero').length;
            const falto = datosSemana.filter(item => item.estado === 'falto').length;
            
            cicloData.semanas[semanaStr].asistio = asistio;
            cicloData.semanas[semanaStr].falto = falto;
            cicloData.totalAsistencias += asistio;
            cicloData.totalFaltas += falto;
        }
        
        resumen.push(cicloData);
    }
    
    return resumen;
}

// Función para mostrar asistencias por ciclo
function mostrarAsistenciasPorCiclo(ciclo) {
    try {
        const contentArea = document.getElementById('tabla-asistencias');
        const resumenArea = document.getElementById('resumen-asistencias');
        
        // Filtrar datos para el ciclo seleccionado
        const datosCiclo = datosAsistencias.filter(item => item.ciclo === ciclo);
        
        // Obtener lista de estudiantes y semanas
        const estudiantes = [...new Set(datosCiclo.map(item => item.nombre))];
        const semanas = ['1', '2', '3', '4'];
        
        // Generar HTML para la tabla
        let html = `<table><tr><th>Estudiante</th>`;
        
        // Encabezados de semanas
        semanas.forEach(semana => {
            html += `<th>Semana ${semana}</th>`;
        });
        
        html += `<th>Total</th></tr>`;
        
        // Filas por estudiante
        estudiantes.forEach(estudiante => {
            html += `<tr><td>${estudiante}</td>`;
            let totalAsistencias = 0;
            
            semanas.forEach(semana => {
                const registro = datosCiclo.find(item => item.nombre === estudiante && item.semana === semana);
                
                if (registro) {
                    if (registro.estado === 'asistio') {
                        html += `<td class="asistio"></td>`;
                        totalAsistencias++;
                    } else if (registro.estado === 'recupero') {
                        html += `<td class="recupero"></td>`;
                        totalAsistencias++;
                    } else if (registro.estado === 'falto') {
                        html += `<td class="falto"></td>`;
                    } else {
                        html += `<td class="sin-dictar"></td>`;
                    }
                } else {
                    html += `<td class="sin-dictar"></td>`;
                }
            });
            
            html += `<td>${totalAsistencias}/4</td></tr>`;
        });
        
        html += `</table>`;
        contentArea.innerHTML = html;
        
        // Calcular y mostrar resumen para este ciclo
        const resumenCiclo = calcularResumenAsistencias().find(r => r.ciclo === ciclo) || { 
            semanas: { '1': { asistio: 0, falto: 0 }, '2': { asistio: 0, falto: 0 }, '3': { asistio: 0, falto: 0 }, '4': { asistio: 0, falto: 0 } },
            totalAsistencias: 0,
            totalFaltas: 0
        };
        
        let resumenHTML = `<h2>Resumen del Ciclo ${ciclo}</h2><table><tr><th>Semana</th><th>Asistencias</th><th>Faltas</th><th>Porcentaje</th></tr>`;
        
        semanas.forEach(semana => {
            const asistio = resumenCiclo.semanas[semana].asistio;
            const falto = resumenCiclo.semanas[semana].falto;
            const total = asistio + falto;
            const porcentaje = total > 0 ? Math.round((asistio / total) * 100) : 0;
            
            resumenHTML += `<tr>
                <td>Semana ${semana}</td>
                <td>${asistio}</td>
                <td>${falto}</td>
                <td>${porcentaje}%</td>
            </tr>`;
        });
        
        resumenHTML += `<tr>
            <td><strong>Total</strong></td>
            <td><strong>${resumenCiclo.totalAsistencias}</strong></td>
            <td><strong>${resumenCiclo.totalFaltas}</strong></td>
            <td><strong>${Math.round((resumenCiclo.totalAsistencias / (resumenCiclo.totalAsistencias + resumenCiclo.totalFaltas)) * 100)}%</strong></td>
        </tr>`;
        
        resumenHTML += `</table>`;
        resumenArea.innerHTML = resumenHTML;
    } catch (error) {
        console.error(`Error al mostrar asistencias para el ciclo ${ciclo}:`, error);
        mostrarErrorAsistencias(`Error al generar la vista para el ciclo ${ciclo}.`);
    }
}

// Exportar funciones para uso global
window.mostrarAsistenciasConsolidadas = mostrarAsistenciasConsolidadas;
window.mostrarAsistenciasPorCiclo = mostrarAsistenciasPorCiclo;
window.cargarDatosAsistencias = cargarDatosAsistencias;