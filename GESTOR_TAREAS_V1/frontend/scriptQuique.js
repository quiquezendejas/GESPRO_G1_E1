const API_URL = "http://localhost:5000/tasks";

function createTask() {
    const nameInput = document.getElementById("taskName");
    const name = nameInput.value;

    if (!name) return;

    fetch(API_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name })
    })
    .then(() => {
        nameInput.value = "";
        loadTasks();
    });
}

function loadTasks() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            const list = document.getElementById("taskList");
            list.innerHTML = "";

            data.forEach(task => {
                const li = document.createElement("li");
                li.textContent = task.name;
                list.appendChild(li);
            });
        });
}

loadTasks();
