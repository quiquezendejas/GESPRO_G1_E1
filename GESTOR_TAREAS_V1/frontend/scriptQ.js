const BASE_URL = 'http://127.0.0.1:5000';
let usuarioActual = null;
let tareasLocales = [];

function entrarComoNormal() {
    mostrarApp({ nombre: "Usuario Externo", rol: "normal", equipo: "G1_E1" });
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
    document.getElementById('u-rol-display').innerText = `Acceso: ${data.rol}`;

    document.getElementById('form-crear').style.display = 'block';

    const esPO = (data.rol === "Product Owner");
    const wipSelect = document.getElementById('wip-limit-select');
    wipSelect.disabled = !esPO;
    wipSelect.style.backgroundColor = esPO ? "#fff" : "#eee";
    wipSelect.style.cursor = esPO ? "pointer" : "not-allowed";

    actualizarTablero();
}

function actualizarTablero() {
    fetch(`${BASE_URL}/tareas`).then(res => res.json()).then(tareas => {
        // --- NUEVA LÓGICA DE ORDENAMIENTO ---
        // Ordenamos las tareas de mayor a menor dificultad antes de mostrarlas
        tareas.sort((a, b) => b.dificultad - a.dificultad);
        
        tareasLocales = tareas;
        const listas = { 'to do': 'list-to-do', 'in progress': 'list-in-progress', 'done': 'list-done' };
        Object.values(listas).forEach(id => document.getElementById(id).innerHTML = '');

        let difProgreso = 0;

        tareas.forEach(t => {
            const card = document.createElement('div');
            card.className = 'task-card';
            card.draggable = true;
            card.ondragstart = (e) => e.dataTransfer.setData("text", t.id);
            
            card.innerHTML = `
                <button class="floating-btn delete-btn" onclick="eliminarTarea(${t.id})">✕</button>
                <button class="floating-btn edit-btn" onclick="abrirModal(${t.id},'${t.nombre}',${t.dificultad},'${t.asignado}')">✎</button>
                <h4 style="margin:0 0 10px 0; color:#333;">${t.nombre}</h4>
                <p style="font-size:0.9em; color:#666; margin-bottom:10px;">${t.descripcion}</p>
                <div>
                    <span class="badge">Dificultad: ${t.dificultad}</span>
                    <span class="badge">👤 ${t.asignado}</span>
                </div>
            `;
            
            if (t.estado === 'in progress') difProgreso += Number(t.dificultad);
            document.getElementById(listas[t.estado]).appendChild(card);
        });

        const limit = Number(document.getElementById('wip-limit-select').value);
        const status = document.getElementById('wip-status');
        status.innerHTML = `Carga Actual: <b>${difProgreso}</b> / Límite: <b>${limit}</b>`;
        
        if (difProgreso >= limit) {
            status.style.color = '#dc3545';
            status.parentNode.style.borderColor = '#dc3545';
        } else {
            status.style.color = '#28a745';
            status.parentNode.style.borderColor = '#ccc';
        }
    });
}

// Resto de funciones (CRUD, Drag & Drop, Login) se mantienen iguales...
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
    if(confirm('¿Desea eliminar esta tarea?')) 
        fetch(`${BASE_URL}/tareas/${id}`, { method: 'DELETE' }).then(actualizarTablero);
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

function allowDrop(e) { e.preventDefault(); }

function drop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text");
    const col = e.target.closest('.column');
    if(!col) return;
    
    const nuevoEstado = col.getAttribute('data-status');
    const tareaAMover = tareasLocales.find(t => t.id == id);

    if (nuevoEstado === 'in progress') {
        const limiteWIP = Number(document.getElementById('wip-limit-select').value);
        const cargaActual = tareasLocales
            .filter(t => t.estado === 'in progress' && t.id != id)
            .reduce((suma, t) => suma + Number(t.dificultad), 0);

        if ((cargaActual + Number(tareaAMover.dificultad)) > limiteWIP) {
            alert(`⚠️ LÍMITE WIP EXCEDIDO: La carga total sería ${cargaActual + Number(tareaAMover.dificultad)}, superando el límite de ${limiteWIP}.`);
            return;
        }
    }

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