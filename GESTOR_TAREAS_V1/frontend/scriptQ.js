const taskForm = document.getElementById('task-form');

// URL base de tu API en Flask
const API_URL = 'http://127.0.0.1:5000/tareas';

// 1. Función para obtener y mostrar las tareas en el tablero
function actualizarTablero() {
    fetch(API_URL)
        .then(response => response.json())
        .then(tareas => {
            // Limpiar las listas actuales para evitar duplicados
            document.getElementById('list-to-do').innerHTML = '';
            document.getElementById('list-in-progress').innerHTML = '';
            document.getElementById('list-done').innerHTML = '';

            // Recorrer cada tarea y crear su tarjeta visual
            tareas.forEach(tarea => {
                const card = document.createElement('div');
                card.className = 'task-card';
                card.innerHTML = `
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

// 2. Evento para manejar el envío del formulario
taskForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Evitar que la página se refresque

    // Capturar los datos del formulario
    const nuevaTarea = {
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        dificultad: document.getElementById('dificultad').value,
        asignado: document.getElementById('asignado').value,
        estado: document.getElementById('estado').value
    };

    // Enviar datos al Backend (POST)
    fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(nuevaTarea)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Éxito:', data.message);
        taskForm.reset();       // Limpiar el formulario
        actualizarTablero();    // <--- Actualizar el tablero visualmente
    })
    .catch(error => {
        alert('Error al conectar con el servidor. Verifica que Flask esté corriendo.');
        console.error('Error:', error);
    });
});

// 3. Cargar las tareas existentes al abrir la página
document.addEventListener('DOMContentLoaded', actualizarTablero);