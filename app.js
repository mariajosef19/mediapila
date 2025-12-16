// bloquear acceso directo a la app //

const token = localStorage.getItem("irupeApp");
if (!token) {
    window.location.href = "login.html";
}

// Obtener al usuario logueado (sin validación, eso lo hace app.html)
const usuario = JSON.parse(localStorage.getItem("usuarioLogueado"));

// Mostrar el nombre del usuario en el botón
const nombreUsuario = document.querySelector("#nombreUsuario");
if (nombreUsuario && usuario) {
    nombreUsuario.textContent = usuario.nombre;
}

let tareas = [];   

// Cargar tareas del usuario desde el localStorage
tareas = JSON.parse(localStorage.getItem(`tareas_${usuario.token}`));

if (!tareas) {
    tareas = tareasMock;  // Si no hay tareas creadas, aparecen las de mock Data
}

// ordena las tareas por fechas Antes de mostrarlas
tareas.sort((a,b) => new Date(a.fecha) - new Date(b.fecha))

const filtroPrioridad = document.querySelector("#filtroPrioridad");
const filtroFecha = document.querySelector("#filtroFecha");
const btnLimpiar = document.querySelector("#btnLimpiarFiltros");

//  Guardar tareas del usuario en localStorage
function guardarTareasUsuario() {
    localStorage.setItem(`tareas_${usuario.token}`, JSON.stringify(tareas));
}

function renderizarListaCompleta() {
    const contenedor = document.querySelector("#contenedorTareas");
    contenedor.innerHTML = "";

    const prioridadElegida = filtroPrioridad ? filtroPrioridad.value : "todas";
    const fechaElegida = filtroFecha ? filtroFecha.value : "";

    const tareasFiltradas = tareas.filter(tarea => {
        const coincidePrioridad = (prioridadElegida === "todas") || (tarea.prioridad === prioridadElegida);
        const coincideFecha = (fechaElegida === "") || (tarea.fecha === fechaElegida);
        return coincidePrioridad && coincideFecha;
    });

    if (tareasFiltradas.length === 0) {
        contenedor.innerHTML = '<div class="alert alert-secondary text-center mt-3">No hay tareas con estos filtros.</div>';
    } else {
        tareasFiltradas.forEach(tarea => renderizarTarea(tarea));
    }
}

//------ Eliminar tarea 
function eliminarTarea(id) {
    //  Eliminar del array
    tareas = tareas.filter(t => t.id !== id);

    // Guardar cambios
    guardarTareasUsuario();

    // Eliminar del DOM
    const tarjeta = document.querySelector(`[data-id="${id}"]`);
    if (tarjeta) tarjeta.remove();

    actualizarColoresSemana();
}

function renderizarTarea(tarea) {
    const contenedor = document.querySelector("#contenedorTareas");
    const div = document.createElement("div");
    div.classList.add("col-12", "mb-3");
    div.dataset.id = tarea.id;

    let colorBorde = "";

    if (tarea.prioridad === "alta") {
        colorBorde = "danger"; 
    } else if (tarea.prioridad === "media") {
        colorBorde = "warning"; 
    } else {
        colorBorde = "success"; 
    }

    div.innerHTML = 
        '<div class="card border-3 border-' + colorBorde + ' shadow-sm">' +
            '<div class="card-body d-flex justify-content-between align-items-center">' +
                
                '<div>' +
                    '<h5 class="card-title fw-bold">' + tarea.nombre + '</h5>' +
                    '<p class="card-text text-muted mb-0">' +
                        '<i class="bi bi-calendar-event"></i> ' + tarea.fecha +
                    '</p>' +
                '</div>' +

                '<div class="d-flex align-items-center gap-2">' +
                    '<span class="badge rounded-pill bg-secondary text-uppercase">' + tarea.prioridad + '</span>' +
                    
                    // Botón Realizada
                    '<button class="btn btn-outline-success btn-sm btn-realizada" title="Marcar como realizada">' +
                        '<i class="bi bi-check-lg"></i>' +
                    '</button>' +
                    
                    // Botón Editar
                    '<button class="btn btn-outline-primary btn-sm btn-editar"><i class="bi bi-pencil-fill"></i></button>' +
                    
                    // Botón Eliminar
                    '<button class="btn btn-outline-danger btn-sm btn-eliminar"><i class="bi bi-trash-fill"></i></button>' +
                '</div>' +
            '</div>' +
        '</div>';

    
    
    // Botón Realizada
    const btnRealizada = div.querySelector(".btn-realizada");
    const tarjeta = div.querySelector(".card");
    const icono = btnRealizada.querySelector("i");

    btnRealizada.addEventListener("click", function() {
        tarjeta.classList.toggle("tarea-realizada");
        
        // Cambiar estilo del boton 
        if (btnRealizada.classList.contains("btn-outline-success")) {
            btnRealizada.classList.remove("btn-outline-success");
            btnRealizada.classList.add("btn-success");
        } else {
            btnRealizada.classList.add("btn-outline-success");
            btnRealizada.classList.remove("btn-success");
        }

        // Cambiar icono
        if (tarjeta.classList.contains("tarea-realizada")) {
            icono.classList.remove("bi-check-lg");
            icono.classList.add("bi-arrow-repeat");
        } else {
            icono.classList.remove("bi-arrow-repeat");
            icono.classList.add("bi-check-lg");
        }
    });

    // Botón Eliminar
    div.querySelector(".btn-eliminar").addEventListener("click", function () {
        if (confirm("¿Seguro que querés eliminar la tarea?")) {
            eliminarTarea(tarea.id);
        }
    });

    // Botón Editar
    div.querySelector(".btn-editar").addEventListener("click", function () {
        document.querySelector("#tareaNombre").value = tarea.nombre;
        document.querySelector("#tareaFecha").value = tarea.fecha;
        document.querySelector("#tareaPrioridad").value = tarea.prioridad;
        document.querySelector('[data-bs-target="#modalTarea"]').click();
        eliminarTarea(tarea.id); 
    });

    contenedor.appendChild(div);
}

function pintarDiaCalendario(tarea) {
    const partes = tarea.fecha.split("-");
    const anioTarea = parseInt(partes[0]);
    const mesTarea = parseInt(partes[1]);
    const diaTarea = parseInt(partes[2]);

    const circulos = document.querySelectorAll(".circuloFecha");

    circulos.forEach(circulo => {
        const diaCalendario = Number(circulo.textContent.trim());
        
        // Verificar que coincidan día, mes Y año
        if (diaCalendario === diaTarea && mesSelec === mesTarea && anioSelec === anioTarea) {
            circulo.classList.add("text-white");

            if (tarea.prioridad === "alta") {
                circulo.classList.remove("bg-warning", "bg-success");
                circulo.classList.add("bg-danger");

            } else if (tarea.prioridad === "media") {
                if (!circulo.classList.contains("bg-danger")) {
                    circulo.classList.remove("bg-success");
                    circulo.classList.add("bg-warning");
                }

            } else {
                if (!circulo.classList.contains("bg-danger") &&
                    !circulo.classList.contains("bg-warning")) {
                    circulo.classList.add("bg-success");
                }
            }
        }
    });
}

function actualizarColoresSemana() {
    const circulos = document.querySelectorAll(".circuloFecha");

    // Limpiar colores anteriores
    circulos.forEach(circulo => {
        circulo.classList.remove("bg-danger", "bg-warning", "bg-success", "text-white");
    });

    // Volver a pintar según TODAS las tareas
    tareas.forEach(tarea => {
        pintarDiaCalendario(tarea);
    });
}

renderizarListaCompleta();
actualizarColoresSemana();

if (filtroPrioridad) filtroPrioridad.addEventListener("change", renderizarListaCompleta);
if (filtroFecha) filtroFecha.addEventListener("change", renderizarListaCompleta);

if (btnLimpiar) {
    btnLimpiar.addEventListener("click", () => {
        filtroPrioridad.value = "todas";
        filtroFecha.value = "";
        renderizarListaCompleta();
    });

}
