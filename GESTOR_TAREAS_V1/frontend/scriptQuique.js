const API_URL = "http://localhost:5000/tasks";

function createTask() {
    const name = document.getElementById("taskName").value;
    const estimation = document.getElementById("taskEstimation").value;
    const assignee = document.getElementById("taskAssignee").value;
    const status = document.getElementById("taskStatus").value;

    if (!name || !estimation || !assignee || !status) return;

    const task = {
        name: name,
        estimation: estimation,
        assignee: assignee,
        status: status
    };

    fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(task)
    })
    .then(() => {
        clearForm();
        loadTasks();
    });
}

function loadTasks() {
    fetch(API_URL)
        .then(response => response.json())
        .then(tasks => {
            const list = document.getElementById("taskList");
            list.innerHTML = "";

            tasks.forEach(task => {
                const li = document.createElement("li");
                li.textContent = `${task.name} (${task.estimation}) | ${task.assignee} | ${task.status}`;
                list.appendChild(li);
            });
        });
}

function clearForm() {
    document.getElementById("taskName").value = "";
    document.getElementById("taskEstimation").value = "";
    document.getElementById("taskAssignee").value = "";
    document.getElementById("taskStatus").value = "TO DO";
}

// Cargar tareas al abrir la página
loadTasks();

