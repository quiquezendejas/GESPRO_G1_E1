console.log("JS cargado correctamente");

const API_URL = "http://localhost:5000/tareas";

function crearTarea() {
    console.log("Botón Crear presionado");

    const nombre = document.getElementById("nombre").value.trim();
    const descripcion = document.getElementById("descripcion").value.trim();
    const dificultad = document.getElementById("dificultad").value;
    const asignado = document.getElementById("asignado").value.trim();
    const estado = document.getElementById("estado").value;

    // Validación básica
    if (!nombre || !descripcion || !dificultad || !asignado || !estado) {
        alert("Completa todos los campos");
        return;
    }

    const tarea = {
        nombre: nombre,
        descripcion: descripcion,
        dificultad: Number(dificultad), // 🔴 MUY IMPORTANTE: número
        asignado: asignado,
        estado: estado
    };

    console.log("Enviando tarea:", tarea);

    fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(tarea)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error("Error en la creación de la tarea");
        }
        return response.json();
    })
    .then(data => {
        console.log("Respuesta backend:", data);
        limpiarFormulario();
        cargarTareas();
    })
    .catch(error => {
        console.error("Error:", error);
        alert("Error al crear la tarea. Revisa la consola.");
    });
}

function cargarTareas() {
    fetch(API_URL)
        .then(response => response.json())
        .then(tareas => {
            const lista = document.getElementById("listaTareas");
            lista.innerHTML = "";

            tareas.forEach(tarea => {
                const li = document.createElement("li");
                li.textContent = `${tarea.nombre} (${tarea.dificultad}) | ${tarea.asignado} | ${tarea.estado}`;
                lista.appendChild(li);
            });
        })
        .catch(error => {
            console.error("Error cargando tareas:", error);
        });
}

function limpiarFormulario() {
    document.getElementById("nombre").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("dificultad").value = "";
    document.getElementById("asignado").value = "";
    document.getElementById("estado").value = "TO DO";
}

// Cargar tareas al abrir la página
cargarTareas();
