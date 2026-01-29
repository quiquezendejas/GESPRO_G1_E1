from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
# IMPORTANTE: CORS(app) permite que tus compañeros se conecten desde sus propias máquinas o carpetas
CORS(app)

# Base de datos temporal
tareas = []

@app.route('/tareas', methods=['GET'])
def obtener_tareas():
    """Para que el equipo de Frontend liste el Kanban"""
    return jsonify(tareas), 200

@app.route('/tareas', methods=['POST'])
def crear_tarea():
    """Para que el equipo de Frontend envíe el formulario"""
    data = request.get_json()
    
    # Validar que lleguen los campos necesarios
    campos_requeridos = ['nombre', 'descripcion', 'dificultad', 'asignado', 'estado']
    if not data or not all(campo in data for campo in campos_requeridos):
        return jsonify({"error": "Faltan datos. Requeridos: " + ", ".join(campos_requeridos)}), 400
    
    nueva_tarea = {
        "id": len(tareas) + 1,
        "nombre": data['nombre'],
        "descripcion": data['descripcion'],
        "dificultad": data['dificultad'],
        "asignado": data['asignado'],
        "estado": data['estado']
    }
    
    tareas.append(nueva_tarea)
    return jsonify({"message": "Tarea creada", "tarea": nueva_tarea}), 201

if __name__ == '__main__':
    # '0.0.0.0' permite que otros en tu misma red WiFi vean tu servidor usando tu IP
    app.run(debug=True, host='0.0.0.0', port=5000)