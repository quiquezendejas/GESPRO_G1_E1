const API_URL = 'http://127.0.0.1:5000/tareas';

function actualizarTablero() {
    fetch(API_URL)
        .then(res => res.json())
        .then(tareas => {
            const listas = {
                'to do': document.getElementById('list-to-do'),
                'in progress': document.getElementById('list-in-progress'),
                'done': document.getElementById('list-done')
            };

            const contadores = { 'to do': 0, 'in progress': 0, 'done': 0 };

            // Limpiar listas
            Object.values(listas).forEach(lista => lista.innerHTML = '');

            // --- PASO CLAVE: Ordenar de Mayor a Menor dificultad ---
            tareas.sort((a, b) => b.dificultad - a.dificultad);

            tareas.forEach(t => {
                if (contadores.hasOwnProperty(t.estado)) {
                    contadores[t.estado] += parseInt(t.dificultad || 0);
                }

                const card = document.createElement('div');
                card.className = 'task-card';
                card.id = `task-${t.id}`;
                card.draggable = true;

                card.ondragstart = (e) => {
                    e.dataTransfer.setData("text/plain", t.id);
                    card.classList.add('dragging');
                };
                card.ondragend = () => card.classList.remove('dragging');

                card.innerHTML = `
                    <button class="floating-btn delete-btn" onclick="eliminarTarea(${t.id})">✕</button>
                    <button class="floating-btn edit-btn" onclick="abrirModal(${t.id}, '${t.nombre}', ${t.dificultad}, '${t.asignado}')">✎</button>
                    <h4>${t.nombre}</h4>
                    <p>${t.descripcion}</p>
                    <div>
                        <span class="badge badge-priority">🔥 Dificultad: ${t.dificultad}</span>
                        <span class="badge">👤 ${t.asignado}</span>
                    </div>
                `;
                
                if (listas[t.estado]) listas[t.estado].appendChild(card);
            });

            // Actualizar contadores
            document.getElementById('sum-to-do').innerText = `Dif: ${contadores['to do']}`;
            document.getElementById('sum-in-progress').innerText = `Dif: ${contadores['in progress']}`;
            document.getElementById('sum-done').innerText = `Dif: ${contadores['done']}`;
        });
}

// --- DRAG & DROP ---
function allowDrop(e) { e.preventDefault(); }
function dragEnter(e) { const col = e.target.closest('.column'); if (col) col.classList.add('drag-over'); }
function dragLeave(e) { const col = e.target.closest('.column'); if (col) col.classList.remove('drag-over'); }

function drop(e) {
    e.preventDefault();
    const col = e.target.closest('.column');
    col.classList.remove('drag-over');
    const idTarea = e.dataTransfer.getData("text/plain");
    const nuevoEstado = col.getAttribute('data-status');

    fetch(`${API_URL}/${idTarea}/estado`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ estado: nuevoEstado })
    }).then(res => { if(res.ok) actualizarTablero(); });
}

// --- CRUD ---
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