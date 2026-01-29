from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # permite conexiones desde cualquier origen

tareas = []

@app.route('/tareas', methods=['GET'])
def obtener_tareas():
    return jsonify(tareas), 200

@app.route('/tareas', methods=['POST'])
def crear_tarea():
    data = request.get_json()
    campos_requeridos = ['nombre', 'descripcion', 'dificultad', 'asignado', 'estado']
    if not data or not all(c in data for c in campos_requeridos):
        return jsonify({"error": "Faltan datos"}), 400

    nueva_tarea = {
        "id": len(tareas) + 1,
        **data
    }
    tareas.append(nueva_tarea)
    return jsonify({"message": "Tarea creada", "tarea": nueva_tarea}), 201

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
