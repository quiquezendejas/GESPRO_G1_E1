from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 🧠 Persistencia en memoria
tasks = []
next_id = 1

@app.route('/tasks', methods=['GET'])
def get_tasks():
    return jsonify(tasks), 200

@app.route('/tasks', methods=['POST'])
def create_task():
    global next_id
    data = request.json

    task = {
        "id": next_id,
        "title": data.get("title"),
        "status": "TODO"
    }

    tasks.append(task)
    next_id += 1

    return jsonify(task), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)

# python appQuique.py
# http://localhost:5000/tasks
# Abrir el archivo "indexQuique-html" desde el explorador de archivos.