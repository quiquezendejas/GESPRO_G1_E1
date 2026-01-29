from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Base de datos temporal en memoria
tareas = []

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"}), 200

@app.route('/tareas', methods=['POST'])
def crear_tarea():
    data = request.get_json()
    
    # Estructura que mencionaste
    nueva_tarea = {
        "id": len(tareas) + 1,
        "nombre": data.get('nombre'),
        "descripcion": data.get('descripcion'),
        "dificultad": data.get('dificultad'), # 1 al 10
        "asignado": data.get('asignado'),
        "estado": data.get('estado') # to do, in progress, done
    }
    
    tareas.append(nueva_tarea)
    print(f"Tarea creada: {nueva_tarea}") # Para ver en la terminal
    return jsonify({"message": "Tarea creada con éxito", "tarea": nueva_tarea}), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)