from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 📌 Lista simulada de tareas (en memoria)
tasks = [
    {
        "id": 1,
        "title": "Crear estructura del proyecto",
        "status": "TODO"
    },
    {
        "id": 2,
        "title": "Configurar backend mínimo",
        "status": "DONE"
    }
]

@app.route('/tasks', methods=['GET'])
def get_tasks():
    return jsonify(tasks), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)

# python appQuique.py
# http://localhost:5000/tasks
# Abrir el archivo "indexQuique-html" desde el explorador de archivos.