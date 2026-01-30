import json
import os
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DB_FILE = 'tareas.json'
USER_FILE = 'usuarios.txt'

def cargar_datos():
    if not os.path.exists(DB_FILE): return []
    try:
        with open(DB_FILE, 'r', encoding='utf-8') as f: return json.load(f)
    except: return []

def guardar_datos(tareas):
    with open(DB_FILE, 'w', encoding='utf-8') as f:
        json.dump(tareas, f, indent=4, ensure_ascii=False)

def validar_usuario(user, password):
    if not os.path.exists(USER_FILE): return None
    with open(USER_FILE, 'r', encoding='utf-8') as f:
        for linea in f:
            partes = linea.strip().split(':')
            if len(partes) == 4 and partes[0] == user and partes[1] == password:
                return {"nombre": partes[2], "equipo": partes[3]}
    return None

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    u_info = validar_usuario(data.get('user'), data.get('password'))
    return jsonify(u_info) if u_info else (jsonify({"error": "Error"}), 401)

@app.route('/tareas', methods=['GET'])
def obtener_tareas():
    return jsonify(cargar_datos()), 200

@app.route('/tareas', methods=['POST'])
def crear_tarea():
    tareas = cargar_datos()
    data = request.get_json()
    nueva = {
        "id": max([t['id'] for t in tareas], default=0) + 1,
        "nombre": data.get('nombre'),
        "descripcion": data.get('descripcion'),
        "dificultad": int(data.get('dificultad', 0)),
        "asignado": data.get('asignado'),
        "estado": data.get('estado')
    }
    tareas.append(nueva)
    guardar_datos(tareas)
    return jsonify(nueva), 201

@app.route('/tareas/<int:id_tarea>', methods=['PUT'])
def editar_tarea(id_tarea):
    tareas = cargar_datos()
    data = request.get_json()
    for t in tareas:
        if t['id'] == id_tarea:
            t.update({
                "nombre": data.get('nombre', t['nombre']),
                "dificultad": int(data.get('dificultad', t['dificultad'])),
                "asignado": data.get('asignado', t['asignado'])
            })
            guardar_datos(tareas)
            return jsonify(t), 200
    return jsonify({"error": "No encontrada"}), 404

@app.route('/tareas/<int:id_tarea>/estado', methods=['PATCH'])
def actualizar_estado(id_tarea):
    tareas = cargar_datos()
    nuevo_est = request.get_json().get('estado')
    for t in tareas:
        if t['id'] == id_tarea:
            t['estado'] = nuevo_est
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