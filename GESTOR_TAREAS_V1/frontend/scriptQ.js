const taskForm = document.getElementById('task-form');

// URL base de tu API en Flask
const API_URL = 'http://127.0.0.1:5000/tareas';

// 1. Función para obtener y mostrar las tareas en el tablero
function actualizarTablero() {
    fetch(API_URL)
        .then(response => response.json())
        .then(tareas => {
            // Limpiar las listas actuales
            document.getElementById('list-to-do').innerHTML = '';
            document.getElementById('list-in-progress').innerHTML = '';
            document.getElementById('list-done').innerHTML = '';

            tareas.forEach(tarea => {
                const card = document.createElement('div');
                card.className = 'task-card';
                
                // Aquí inyectamos el botón de eliminar (X)
                card.innerHTML = `
                    <button class="delete-btn" onclick="eliminarTarea(${tarea.id})" title="Eliminar tarea">
                        ✕
                    </button>
                    <h4>${tarea.nombre}</h4>
                    <p>${tarea.descripcion}</p>
                    <div class="badge-container">
                        <span class="badge">Dificultad: ${tarea.dificultad}</span>
                        <span class="badge">👤 ${tarea.asignado}</span>
                    </div>
                `;

                // Ubicar la tarjeta en la columna correspondiente
                if (tarea.estado === 'to do') {
                    document.getElementById('list-to-do').appendChild(card);
                } else if (tarea.estado === 'in progress') {
                    document.getElementById('list-in-progress').appendChild(card);
                } else if (tarea.estado === 'done') {
                    document.getElementById('list-done').appendChild(card);
                }
            });
        })
        .catch(error => console.error('Error al cargar tareas:', error));
}

// 2. Evento para crear tarea
taskForm.addEventListener('submit', (e) => {
    e.preventDefault(); 

    const nuevaTarea = {
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        dificultad: document.getElementById('dificultad').value,
        asignado: document.getElementById('asignado').value,
        estado: document.getElementById('estado').value
    };

    fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaTarea)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Éxito:', data.message);
        taskForm.reset();       
        actualizarTablero();    
    })
    .catch(error => {
        alert('Error al conectar con el servidor.');
        console.error('Error:', error);
    });
});

// 3. NUEVA FUNCIÓN: Eliminar Tarea
function eliminarTarea(id) {
    // Confirmación simple para evitar borrados accidentales
    if (!confirm("¿Estás seguro de querer eliminar esta tarea?")) {
        return;
    }

    fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
    })
    .then(response => {
        if (response.ok) {
            console.log(`Tarea ${id} eliminada`);
            actualizarTablero(); // Recargamos el tablero para ver los cambios
        } else {
            console.error('Error al eliminar tarea');
        }
    })
    .catch(error => console.error('Error de red:', error));
}

// 4. Cargar tareas al inicio
document.addEventListener('DOMContentLoaded', actualizarTablero);