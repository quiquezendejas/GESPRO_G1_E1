const BASE_URL = 'http://127.0.0.1:5000';
let usuarioActual = null;
let tareasLocales = [];

function entrarComoInvitado() {
    mostrarApp({ nombre: "Invitado", rol: "invitado", equipo: "G1_E1" });
}

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
    usuarioActual = data;
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    document.getElementById('u-name').innerText = data.nombre;
    document.getElementById('u-rol-display').innerText = `Rol: ${data.rol}`;

    const esPO = data.rol === "Product Owner";
    const esNormal = data.rol === "normal";
    const esInvitado = data.rol === "invitado";

    // 1. Mostrar formulario si es PO o Normal
    document.getElementById('form-crear').style.display = (esPO || esNormal) ? 'block' : 'none';

    // 2. Bloquear WIP select si NO es Product Owner
    const wipSelect = document.getElementById('wip-limit-select');
    wipSelect.disabled = !esPO;
    wipSelect.style.cursor = esPO ? "pointer" : "not-allowed";
    wipSelect.style.backgroundColor = esPO ? "#fff" : "#eee";

    actualizarTablero();
}

function actualizarTablero() {
    fetch(`${BASE_URL}/tareas`).then(res => res.json()).then(tareas => {
        tareasLocales = tareas;
        const listas = { 'to do': 'list-to-do', 'in progress': 'list-in-progress', 'done': 'list-done' };
        Object.values(listas).forEach(id => document.getElementById(id).innerHTML = '');

        let difProgreso = 0;
        const puedeGestionar = (usuarioActual.rol === "Product Owner" || usuarioActual.rol === "normal");

        tareas.forEach(t => {
            const card = document.createElement('div');
            card.className = 'task-card';
            
            if (puedeGestionar) {
                card.draggable = true;
                card.ondragstart = (e) => e.dataTransfer.setData("text", t.id);
                card.innerHTML = `
                    <button class="floating-btn delete-btn" onclick="eliminarTarea(${t.id})">✕</button>
                    <button class="floating-btn edit-btn" onclick="abrirModal(${t.id},'${t.nombre}',${t.dificultad},'${t.asignado}')">✎</button>
                `;
            }

            card.innerHTML += `<h4>${t.nombre}</h4><p>${t.descripcion}</p>
                <div><span class="badge">Dif: ${t.dificultad}</span><span class="badge">👤 ${t.asignado.split(' ')[0]}</span></div>`;
            
            if (t.estado === 'in progress') difProgreso += Number(t.dificultad);
            document.getElementById(listas[t.estado]).appendChild(card);
        });

        const limit = Number(document.getElementById('wip-limit-select').value);
        const status = document.getElementById('wip-status');
        status.innerText = `Carga: ${difProgreso} / ${limit}`;
        status.style.color = difProgreso > limit * 1.1 ? 'red' : (difProgreso > limit ? 'orange' : 'green');
    });
}

// Operaciones CRUD
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

function eliminarTarea(id) {
    if(confirm('¿Borrar tarea?')) fetch(`${BASE_URL}/tareas/${id}`, { method: 'DELETE' }).then(actualizarTablero);
}

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

function allowDrop(e) { if (usuarioActual.rol !== "invitado") e.preventDefault(); }
function drop(e) {
    if (usuarioActual.rol === "invitado") return;
    const id = e.dataTransfer.getData("text");
    const nuevoEstado = e.target.closest('.column').getAttribute('data-status');
    fetch(`${BASE_URL}/tareas/${id}/estado`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ estado: nuevoEstado })
    }).then(actualizarTablero);
}

function logout() { localStorage.removeItem('sesion_g1'); location.reload(); }

document.addEventListener('DOMContentLoaded', () => {
    const s = localStorage.getItem('sesion_g1');
    if(s) mostrarApp(JSON.parse(s));
});