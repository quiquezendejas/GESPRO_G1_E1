const API_URL = 'http://127.0.0.1:5000/tareas';
let tareasLocales = []; 

function actualizarTablero() {
    fetch(API_URL)
        .then(res => res.json())
        .then(tareas => {
            tareasLocales = tareas;
            const listas = {
                'to do': document.getElementById('list-to-do'),
                'in progress': document.getElementById('list-in-progress'),
                'done': document.getElementById('list-done')
            };

            Object.values(listas).forEach(l => l.innerHTML = '');

            let difAcumulada = 0;

            tareas.forEach(t => {
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
                        <span class="badge">Dificultad: ${t.dificultad}</span>
                        <span class="badge">👤 ${t.asignado}</span>
                    </div>
                `;
                
                if (t.estado === 'in progress') {
                    difAcumulada += Number(t.dificultad); // Conversión explícita
                }
                
                if (listas[t.estado]) listas[t.estado].appendChild(card);
            });

            const limit = Number(document.getElementById('wip-limit-select').value);
            const statusEl = document.getElementById('wip-status');
            statusEl.innerText = `Dificultad: ${difAcumulada} / ${limit}`;
            statusEl.style.color = difAcumulada >= limit ? '#ff4d4d' : '#28a745';
        });
}

function allowDrop(e) { e.preventDefault(); }
function dragEnter(e) { const col = e.target.closest('.column'); if (col) col.classList.add('drag-over'); }
function dragLeave(e) { const col = e.target.closest('.column'); if (col) col.classList.remove('drag-over'); }

function drop(e) {
    e.preventDefault();
    const col = e.target.closest('.column');
    col.classList.remove('drag-over');
    
    const idTarea = e.dataTransfer.getData("text/plain");
    const nuevoEstado = col.getAttribute('data-status');

    if (nuevoEstado === 'in progress') {
        const tareaMoviendo = tareasLocales.find(t => t.id == idTarea);
        
        // Solo validamos si la tarea NO estaba ya en 'in progress'
        if (tareaMoviendo && tareaMoviendo.estado !== 'in progress') {
            
            // Calculamos la suma actual de lo que ya hay en la columna
            const sumaActual = tareasLocales
                .filter(t => t.estado === 'in progress')
                .reduce((acc, t) => acc + Number(t.dificultad), 0);
            
            const limiteWIP = Number(document.getElementById('wip-limit-select').value);
            const dificultadTarea = Number(tareaMoviendo.dificultad);

            console.log(`Validando: Actual(${sumaActual}) + Nueva(${dificultadTarea}) vs Límite(${limiteWIP})`);

            if (sumaActual + dificultadTarea > limiteWIP) {
                alert(`⚠️ No se puede mover: La carga actual es ${sumaActual}. Esta tarea suma ${dificultadTarea}, excediendo el límite de ${limiteWIP}.`);
                return;
            }
        }
    }

    fetch(`${API_URL}/${idTarea}/estado`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ estado: nuevoEstado })
    }).then(res => { if(res.ok) actualizarTablero(); });
}

// --- FORMULARIOS ---

document.getElementById('task-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        dificultad: Number(document.getElementById('dificultad').value),
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
    if(confirm('¿Borrar?')) fetch(`${API_URL}/${id}`, { method: 'DELETE' }).then(() => actualizarTablero());
}

function abrirModal(id, nombre, dif, asig) {
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-nombre').value = nombre;
    document.getElementById('edit-dificultad').value = Number(dif);
    document.getElementById('edit-asignado').value = asig;
    document.getElementById('edit-modal').style.display = 'flex';
}
function cerrarModal() { document.getElementById('edit-modal').style.display = 'none'; }

function guardarEdicion() {
    const id = document.getElementById('edit-id').value;
    const data = {
        nombre: document.getElementById('edit-nombre').value,
        dificultad: Number(document.getElementById('edit-dificultad').value),
        asignado: document.getElementById('edit-asignado').value
    };
    fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    }).then(() => { cerrarModal(); actualizarTablero(); });
}

document.addEventListener('DOMContentLoaded', actualizarTablero);