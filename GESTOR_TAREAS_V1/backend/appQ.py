from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Base de datos temporal en memoria
tareas = []

@app.route('/tareas', methods=['GET'])
def obtener_tareas():
    return jsonify(tareas), 200

@app.route('/tareas', methods=['POST'])
def crear_tarea():
    data = request.get_json()
    nueva_tarea = {
        "id": len(tareas) + 1,
        "nombre": data.get('nombre'),
        "descripcion": data.get('descripcion'),
        "dificultad": data.get('dificultad'),
        "asignado": data.get('asignado'),
        "estado": data.get('estado')
    }
    tareas.append(nueva_tarea)
    return jsonify(nueva_tarea), 201

@app.route('/tareas/<int:id_tarea>', methods=['DELETE'])
def eliminar_tarea(id_tarea):
    global tareas
    tareas = [t for t in tareas if t['id'] != id_tarea]
    return jsonify({"status": "deleted"}), 200

@app.route('/tareas/<int:id_tarea>', methods=['PUT'])
def editar_tarea(id_tarea):
    data = request.get_json()
    for t in tareas:
        if t['id'] == id_tarea:
            t['nombre'] = data.get('nombre', t['nombre'])
            t['dificultad'] = data.get('dificultad', t['dificultad'])
            t['asignado'] = data.get('asignado', t['asignado'])
            return jsonify(t), 200
    return jsonify({"error": "No encontrada"}), 404

# RUTA PARA ACTUALIZAR ESTADO (DRAG & DROP)
@app.route('/tareas/<int:id_tarea>/estado', methods=['PATCH'])
def actualizar_estado(id_tarea):
    nuevo_estado = request.get_json().get('estado')
    for t in tareas:
        if t['id'] == id_tarea:
            t['estado'] = nuevo_estado
            return jsonify(t), 200
    return jsonify({"error": "No encontrada"}), 404

if __name__ == '__main__':
    app.run(debug=True, port=5000)