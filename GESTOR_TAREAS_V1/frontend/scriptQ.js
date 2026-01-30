const BASE_URL = 'http://127.0.0.1:5000';
let tareasLocales = [];

// --- SESIÓN ---
function intentarLogin() {
    const user = document.getElementById('l-user').value;
    const pass = document.getElementById('l-pass').value;
    fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ user, password: pass })
    })
    .then(res => res.ok ? res.json() : Promise.reject())
    .then(data => {
        localStorage.setItem('sesion_g1', JSON.stringify(data));
        mostrarApp(data);
    })
    .catch(() => document.getElementById('l-err').style.display = 'block');
}

function mostrarApp(data) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    document.getElementById('u-name').innerText = data.nombre;
    document.getElementById('u-team').innerText = data.equipo;
    actualizarTablero();
}

function logout() { localStorage.removeItem('sesion_g1'); location.reload(); }

// --- KANBAN ---
function actualizarTablero() {
    fetch(`${BASE_URL}/tareas`).then(res => res.json()).then(tareas => {
        tareasLocales = tareas;
        const listas = { 'to do': 'list-to-do', 'in progress': 'list-in-progress', 'done': 'list-done' };
        Object.values(listas).forEach(id => document.getElementById(id).innerHTML = '');

        let difProgreso = 0;
        tareas.forEach(t => {
            const card = document.createElement('div');
            card.className = 'task-card';
            card.draggable = true;
            card.ondragstart = (e) => { e.dataTransfer.setData("text", t.id); card.classList.add('dragging'); };
            card.ondragend = () => card.classList.remove('dragging');
            card.innerHTML = `
                <button class="floating-btn delete-btn" onclick="eliminarTarea(${t.id})">✕</button>
                <button class="floating-btn edit-btn" onclick="abrirModal(${t.id},'${t.nombre}',${t.dificultad},'${t.asignado}')">✎</button>
                <h4>${t.nombre}</h4><p>${t.descripcion}</p>
                <div><span class="badge">Dificultad: ${t.dificultad}</span><span class="badge">👤 ${t.asignado}</span></div>
            `;
            if (t.estado === 'in progress') difProgreso += Number(t.dificultad);
            document.getElementById(listas[t.estado]).appendChild(card);
        });

        const limit = Number(document.getElementById('wip-limit-select').value);
        const status = document.getElementById('wip-status');
        status.innerText = `Carga: ${difProgreso} / ${limit} (Tol: ${(limit*1.1).toFixed(1)})`;
        status.style.color = difProgreso > limit * 1.1 ? 'red' : (difProgreso > limit ? 'orange' : 'green');
    });
}

// --- DRAG & DROP ---
function allowDrop(e) { e.preventDefault(); }
function dragEnter(e) { e.target.closest('.column')?.classList.add('drag-over'); }
function dragLeave(e) { e.target.closest('.column')?.classList.remove('drag-over'); }

function drop(e) {
    e.preventDefault();
    const col = e.target.closest('.column');
    col.classList.remove('drag-over');
    const id = e.dataTransfer.getData("text");
    const nuevoEstado = col.getAttribute('data-status');

    if (nuevoEstado === 'in progress') {
        const t = tareasLocales.find(x => x.id == id);
        const actual = tareasLocales.filter(x => x.estado === 'in progress').reduce((a,b) => a + Number(b.dificultad), 0);
        const max = Number(document.getElementById('wip-limit-select').value) * 1.1;
        if (t.estado !== 'in progress' && (actual + Number(t.dificultad)) > max) {
            alert("Límite WIP excedido."); return;
        }
    }

    fetch(`${BASE_URL}/tareas/${id}/estado`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ estado: nuevoEstado })
    }).then(actualizarTablero);
}

// --- CRUD ---
document.getElementById('task-form').onsubmit = (e) => {
    e.preventDefault();
    const data = {
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        dificultad: document.getElementById('dificultad').value,
        asignado: document.getElementById('asignado').value,
        estado: document.getElementById('estado').value
    };
    fetch(`${BASE_URL}/tareas`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    }).then(() => { e.target.reset(); actualizarTablero(); });
};

function eliminarTarea(id) { if(confirm('¿Borrar?')) fetch(`${BASE_URL}/tareas/${id}`, {method:'DELETE'}).then(actualizarTablero); }

function abrirModal(id, nom, dif, asig) {
    document.getElementById('edit-id').value = id;
    document.getElementById('edit-nombre').value = nom;
    document.getElementById('edit-dificultad').value = dif;
    document.getElementById('edit-asignado').value = asig;
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
    fetch(`${BASE_URL}/tareas/${id}`, {
        method: 'PUT',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    }).then(() => { cerrarModal(); actualizarTablero(); });
}

document.addEventListener('DOMContentLoaded', () => {
    const s = localStorage.getItem('sesion_g1');
    if(s) mostrarApp(JSON.parse(s));
});