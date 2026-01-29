const API_URL = 'http://127.0.0.1:5000/tareas';

function actualizarTablero() {
    fetch(API_URL)
        .then(res => res.json())
        .then(tareas => {
            ['list-to-do', 'list-in-progress', 'list-done'].forEach(id => document.getElementById(id).innerHTML = '');

            tareas.forEach(t => {
                const card = document.createElement('div');
                card.className = 'task-card';
                card.innerHTML = `
                    <button class="floating-btn delete-btn" onclick="eliminarTarea(${t.id})">✕</button>
                    <button class="floating-btn edit-btn" onclick="abrirModal(${t.id}, '${t.nombre}', ${t.dificultad}, '${t.asignado}')">✎</button>
                    <h4>${t.nombre}</h4>
                    <p>${t.descripcion}</p>
                    <div>
                        <span class="badge">Dificultad: ${t.dificultad}</span>
                        <span class="badge">👤 ${t.asignado}</span>
                    </div>
                `;
                const listId = `list-${t.estado.replace(' ', '-')}`;
                document.getElementById(listId).appendChild(card);
            });
        });
}

document.getElementById('task-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        dificultad: document.getElementById('dificultad').value,
        asignado: document.getElementById('asignado').value,
        estado: document.getElementById('estado').value
    };
    fetch(API_URL, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    }).then(() => { e.target.reset(); actualizarTablero(); });
});

function eliminarTarea(id) {
    if(confirm('¿Borrar tarea?')) {
        fetch(`${API_URL}/${id}`, { method: 'DELETE' }).then(() => actualizarTablero());
    }
}

function abrirModal(id, nombre, dificultad, asignado) {
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-nombre').value = nombre;
    document.getElementById('edit-dificultad').value = dificultad;
    document.getElementById('edit-asignado').value = asignado;
    document.getElementById('edit-modal').style.display = 'flex';
}

function cerrarModal() { document.getElementById('edit-modal').style.display = 'none'; }

function guardarEdicion() {
    const id = document.getElementById('edit-id').value;
    const data = {
        nombre: document.getElementById('edit-nombre').value,
        dificultad: document.getElementById('edit-dificultad').value,
        asignado: document.getElementById('edit-asignado').value
    };
    fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    }).then(() => { cerrarModal(); actualizarTablero(); });
}

document.addEventListener('DOMContentLoaded', actualizarTablero);