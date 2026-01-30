import json
import os
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Nombre del archivo persistente
DB_FILE = 'tareas.json'

def cargar_datos():
    """Lee las tareas del archivo JSON."""
    if not os.path.exists(DB_FILE):
        return []
    try:
        with open(DB_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return []

def guardar_datos(tareas):
    """Guarda la lista de tareas en el archivo JSON."""
    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(tareas, f, indent=4, ensure_ascii=False)

# --- RUTAS DE LA API ---

@app.route('/tareas', methods=['GET'])
def obtener_tareas():
    tareas = cargar_datos()
    return jsonify(tareas), 200

@app.route('/tareas', methods=['POST'])
def crear_tarea():
    tareas = cargar_datos()
    data = request.get_json()
    
    # Generar ID basado en el último ID existente
    nuevo_id = max([t['id'] for t in tareas], default=0) + 1
    
    nueva_tarea = {
        "id": nuevo_id,
        "nombre": data.get('nombre'),
        "descripcion": data.get('descripcion'),
        "dificultad": data.get('dificultad'),
        "asignado": data.get('asignado'),
        "estado": data.get('estado')
    }
    
    tareas.append(nueva_tarea)
    guardar_datos(tareas)
    return jsonify(nueva_tarea), 201

@app.route('/tareas/<int:id_tarea>', methods=['DELETE'])
def eliminar_tarea(id_tarea):
    tareas = cargar_datos()
    tareas_filtradas = [t for t in tareas if t['id'] != id_tarea]
    guardar_datos(tareas_filtradas)
    return jsonify({"status": "deleted"}), 200

@app.route('/tareas/<int:id_tarea>', methods=['PUT'])
def editar_tarea(id_tarea):
    tareas = cargar_datos()
    data = request.get_json()
    for t in tareas:
        if t['id'] == id_tarea:
            t['nombre'] = data.get('nombre', t['nombre'])
            t['dificultad'] = data.get('dificultad', t['dificultad'])
            t['asignado'] = data.get('asignado', t['asignado'])
            guardar_datos(tareas)
            return jsonify(t), 200
    return jsonify({"error": "No encontrada"}), 404

@app.route('/tareas/<int:id_tarea>/estado', methods=['PATCH'])
def actualizar_estado(id_tarea):
    tareas = cargar_datos()
    nuevo_estado = request.get_json().get('estado')
    for t in tareas:
        if t['id'] == id_tarea:
            t['estado'] = nuevo_estado
            guardar_datos(tareas)
            return jsonify(t), 200
    return jsonify({"error": "No encontrada"}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)