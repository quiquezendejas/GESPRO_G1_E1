const API_URL = "http://localhost:5000/tasks";

function loadTasks() {
    fetch(API_URL)
        .then(response => response.json())
        .then(tasks => {
            const list = document.getElementById("taskList");
            list.innerHTML = "";

            tasks.forEach(task => {
                const li = document.createElement("li");
                li.textContent = `${task.title} [${task.status}]`;
                list.appendChild(li);
            });
        })
        .catch(error => {
            console.error("Error al cargar tareas:", error);
        });
}

// Cargar tareas al abrir la página
loadTasks();
