const API_URL = "http://127.0.0.1:5000/tareas"; // apuntando al backend
let dificultadSeleccionada = null;

document.addEventListener("DOMContentLoaded", () => {
    const difBtns = document.querySelectorAll('.dif-btn');
    difBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            dificultadSeleccionada = Number(btn.dataset.value);
            difBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    document.getElementById("btn-crear").addEventListener("click", crearTarea);
    cargarTareas();
});

function crearTarea() {
    const tarea = {
        nombre: document.getElementById("nombre").value.trim(),
        descripcion: document.getElementById("descripcion").value.trim(),
        dificultad: dificultadSeleccionada,
        asignado: document.getElementById("asignado").value.trim(),
        estado: document.getElementById("estado").value
    };

    if (!tarea.nombre || !tarea.dificultad || !tarea.asignado) {
        alert("Por favor completa: nombre, dificultad y asignado");
        return;
    }

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tarea)
    })
    .then(res => res.json())
    .then(() => {
        limpiarFormulario();
        cargarTareas();
    })
    .catch(err => console.error(err));
}

function cargarTareas() {
    fetch(API_URL)
    .then(res => res.json())
    .then(tareas => {
        document.getElementById("todoList").innerHTML = "";
        document.getElementById("progressList").innerHTML = "";
        document.getElementById("doneList").innerHTML = "";

        tareas.forEach(t => {
            const li = document.createElement("li");
            li.className = "task";
            li.innerHTML = `<strong>${t.nombre}</strong><br>${t.descripcion}<br>
                            <small style="color: var(--accent)">Dificultad: ${t.dificultad} | ${t.asignado}</small>`;

            if (t.estado === "TO DO") document.getElementById("todoList").appendChild(li);
            else if (t.estado === "IN PROGRESS") document.getElementById("progressList").appendChild(li);
            else document.getElementById("doneList").appendChild(li);
        });
    });
}

function limpiarFormulario() {
    document.getElementById("nombre").value = "";
    document.getElementById("descripcion").value = "";
    document.getElementById("asignado").value = "";
    dificultadSeleccionada = null;
    document.querySelectorAll('.dif-btn').forEach(b => b.classList.remove('active'));
}
