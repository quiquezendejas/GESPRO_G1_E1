import json
import os
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DB_FILE = 'tareas.json'

def cargar_datos():
    if not os.path.exists(DB_FILE): return []
    try:
        with open(DB_FILE, 'r', encoding='utf-8') as f: return json.load(f)
    except: return []

def guardar_datos(tareas):
    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(tareas, f, indent=4, ensure_ascii=False)

@app.route('/tareas', methods=['GET'])
def obtener_tareas():
    return jsonify(cargar_datos()), 200

@app.route('/tareas', methods=['POST'])
def crear_tarea():
    tareas = cargar_datos()
    data = request.get_json()
    nuevo_id = max([t['id'] for t in tareas], default=0) + 1
    nueva_tarea = {
        "id": nuevo_id,
        "nombre": data.get('nombre'),
        "descripcion": data.get('descripcion'),
        "dificultad": int(data.get('dificultad', 0)), # Forzar entero
        "asignado": data.get('asignado'),
        "estado": data.get('estado')
    }
    tareas.append(nueva_tarea)
    guardar_datos(tareas)
    return jsonify(nueva_tarea), 201

@app.route('/tareas/<int:id_tarea>', methods=['PUT'])
def editar_tarea(id_tarea):
    tareas = cargar_datos()
    data = request.get_json()
    for t in tareas:
        if t['id'] == id_tarea:
            t['nombre'] = data.get('nombre', t['nombre'])
            t['dificultad'] = int(data.get('dificultad', t['dificultad'])) # Forzar entero
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

@app.route('/tareas/<int:id_tarea>', methods=['DELETE'])
def eliminar_tarea(id_tarea):
    tareas = [t for t in cargar_datos() if t['id'] != id_tarea]
    guardar_datos(tareas)
    return jsonify({"status": "deleted"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)