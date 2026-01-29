const taskForm = document.getElementById('task-form');

taskForm.addEventListener('submit', (e) => {
    e.preventDefault(); // Evita que la página se recargue

    const nuevaTarea = {
        nombre: document.getElementById('nombre').value,
        descripcion: document.getElementById('descripcion').value,
        dificultad: document.getElementById('dificultad').value,
        asignado: document.getElementById('asignado').value,
        estado: document.getElementById('estado').value
    };

    fetch('http://127.0.0.1:5000/tareas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nuevaTarea)
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        taskForm.reset(); // Limpia el formulario
    })
    .catch(err => console.error("Error:", err));
});