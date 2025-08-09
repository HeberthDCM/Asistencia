// Configuración de Google Drive API
const API_KEY = 'AIzaSyDIpQy54Q3Cp7Z54D5d90P1_x5L9OsVmMU'; // Reemplaza con tu API key
const SPREADSHEET_ID = '1FrHbDkzWdI9azvVQQywSr2j8tB3V6PPF_3YAfXsP6Hg'; // Reemplaza con el ID de tu archivo
const SHEET_NAME = 'pagos'; // Nombre de la hoja en tu archivo

// Datos de pagos
let datosPagos = [];

// Función para cargar datos de pagos desde Google Sheets
async function cargarDatosPagos() {
    const errorBox = document.getElementById("error");
    try {
        console.log("Iniciando carga de datos de pagos desde Google Drive...");
        alert("1 Cargando datos de pagos desde Google Drive...");
        // Construir la URL para la API de Google Sheets
        //const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_NAME}?key=${API_KEY}`;
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${encodeURIComponent(SHEET_NAME)}?key=${API_KEY}`;
        // Realizar la solicitud a la API
        const response = await fetch(url);
        aler3t("3 solicitudde api...");
        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }
        alert("2 Datos de pagos cargados correctamente desde Google Drive");
        const data = await response.json();
        renderizarTabla(data.values); // agregado por mi
        // Verificar si hay datos
        if (!data.values || data.values.length === 0) {
            alert("4 No se encontraron datos en la hoja de cálculo.");
            throw new Error("No se encontraron datos en la hoja de cálculo");
        }
        
        // Procesar los datos
        const [headers, ...rows] = data.values;
        
        // Validar estructura de datos
        const expectedHeaders = ['nombre', 'ciclo', 'estado'];
        if (!expectedHeaders.every(h => headers.includes(h))) {
            alert("La estructura del archivo no coincide con lo esperado. Asegúrate de que las columnas sean: nombre, ciclo, estado.");
            throw new Error("La estructura del archivo no coincide con lo esperado");
        }
        
        // Mapear filas a objetos
        datosPagos = rows.map(row => {
            // Encontrar índices de las columnas
            const nombreIndex = headers.indexOf('nombre');
            const cicloIndex = headers.indexOf('ciclo');
            const estadoIndex = headers.indexOf('estado');
            
            return {
                nombre: row[nombreIndex],
                ciclo: row[cicloIndex],
                estado: row[estadoIndex].toLowerCase()
            };
        });
        
        console.log("Datos de pagos cargados correctamente desde Google Drive");
        console.log("Registros cargados:", datosPagos.length);
        
        // Mostrar tabla de pagos
        mostrarTablaPagos();
    } catch (error) {
        console.error("Error al cargar datos de pagos:", error);
        
        let errorMessage = "Error al cargar los datos de pagos. ";
        
        if (error.message.includes("404")) {
            errorMessage += "No se encontró el archivo. Verifica el ID de la hoja de cálculo.";
        } else if (error.message.includes("403")) {
            errorMessage += "Problema de autenticación. Verifica tu API key.";
        } else if (error.message.includes("No se encontraron datos")) {
            errorMessage += "El archivo está vacío o no tiene los datos esperados.";
        } else {
            errorMessage += `Detalles: ${error.message}`;
        }
        
        mostrarErrorPagos(errorMessage);
        
        // Mostrar datos de ejemplo como respaldo
        console.log("Cargando datos de ejemplo como respaldo...");
        cargarDatosEjemploPagos();
    }
}

function renderizarTabla(values) {
    const [headers, ...rows] = values;
    const thead = document.querySelector("#dataTable thead");
    const tbody = document.querySelector("#dataTable tbody");

    thead.innerHTML = "<tr>" + headers.map(h => `<th>${h}</th>`).join("") + "</tr>";
    tbody.innerHTML = rows.map(row => 
        "<tr>" + headers.map((_, i) => `<td>${row[i] || ""}</td>`).join("") + "</tr>"
    ).join("");
}



// Función para cargar datos de ejemplo (respaldo)
function cargarDatosEjemploPagos() {
    datosPagos = [
        { nombre: "Juan Pérez", ciclo: "1", estado: "pagado" },
        { nombre: "Juan Pérez", ciclo: "2", estado: "pendiente" },
        { nombre: "Juan Pérez", ciclo: "3", estado: "sin generar" },
        { nombre: "Juan Pérez", ciclo: "4", estado: "retirado" },
        { nombre: "Juan Pérez", ciclo: "5", estado: "sin generar" },
        { nombre: "María Gómez", ciclo: "1", estado: "pagado" },
        { nombre: "María Gómez", ciclo: "2", estado: "pagado" },
        { nombre: "María Gómez", ciclo: "3", estado: "pagado" },
        { nombre: "María Gómez", ciclo: "4", estado: "pendiente" },
        { nombre: "María Gómez", ciclo: "5", estado: "sin generar" },
        { nombre: "Carlos Ruiz", ciclo: "1", estado: "pagado" },
        { nombre: "Carlos Ruiz", ciclo: "2", estado: "falto" },
        { nombre: "Carlos Ruiz", ciclo: "3", estado: "retirado" },
        { nombre: "Carlos Ruiz", ciclo: "4", estado: "retirado" },
        { nombre: "Carlos Ruiz", ciclo: "5", estado: "retirado" }
    ];
    
    mostrarTablaPagos();
}


// Función para mostrar la tabla de pagos
function mostrarTablaPagos() {
    try {
        const contentArea = document.getElementById('tabla-pagos');
        
        // Obtener lista de estudiantes y ciclos
        const estudiantes = [...new Set(datosPagos.map(item => item.nombre))];
        const ciclos = ['1', '2', '3', '4', '5'];
        
        // Generar HTML para la tabla
        let html = `<table><tr><th>Estudiante</th>`;
        
        // Encabezados de ciclos
        ciclos.forEach(ciclo => {
            html += `<th>Ciclo ${ciclo}</th>`;
        });
        
        html += `<th>Estado General</th></tr>`;
        
        // Filas por estudiante
        estudiantes.forEach(estudiante => {
            html += `<tr><td>${estudiante}</td>`;
            let pagosCompletos = 0;
            let tienePendientes = false;
            let retirado = false;
            
            ciclos.forEach(ciclo => {
                const registro = datosPagos.find(item => item.nombre === estudiante && item.ciclo === ciclo);
                
                if (registro) {
                    if (registro.estado === 'pagado') {
                        html += `<td class="pagado">Pagado</td>`;
                        pagosCompletos++;
                    } else if (registro.estado === 'pendiente') {
                        html += `<td class="pendiente">Pendiente</td>`;
                        tienePendientes = true;
                    } else if (registro.estado === 'retirado') {
                        html += `<td class="retirado">Retirado</td>`;
                        retirado = true;
                    } else {
                        html += `<td class="sin-generar">-</td>`;
                    }
                } else {
                    html += `<td class="sin-generar">-</td>`;
                }
            });
            
            // Determinar estado general
            let estadoGeneral = '';
            let estadoClass = '';
            
            if (retirado) {
                estadoGeneral = 'Retirado';
                estadoClass = 'retirado';
            } else if (pagosCompletos === ciclos.length) {
                estadoGeneral = 'Completo';
                estadoClass = 'pagado';
            } else if (tienePendientes) {
                estadoGeneral = 'Pendiente';
                estadoClass = 'pendiente';
            } else {
                estadoGeneral = 'Incompleto';
                estadoClass = 'sin-generar';
            }
            
            html += `<td class="${estadoClass}">${estadoGeneral}</td></tr>`;
        });
        
        html += `</table>`;
        contentArea.innerHTML = html;
    } catch (error) {
        console.error("Error al mostrar tabla de pagos:", error);
        mostrarErrorPagos("Error al generar la tabla de pagos.");
    }
}

// Exportar funciones para uso global
window.cargarDatosPagos = cargarDatosPagos;
window.mostrarTablaPagos = mostrarTablaPagos;