from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
# Habilita CORS para permitir peticiones desde tu frontend
CORS(app)

# Base de datos temporal en memoria
tareas = []

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "online",
        "message": "Servidor de GESPRO G1_E1 funcionando"
    }), 200

@app.route('/tareas', methods=['GET'])
def obtener_tareas():
    return jsonify(tareas), 200

@app.route('/tareas', methods=['POST'])
def crear_tarea():
    data = request.get_json()
    
    nueva_tarea = {
        "id": len(tareas) + 1, # ID simple incremental
        "nombre": data.get('nombre'),
        "descripcion": data.get('descripcion'),
        "dificultad": data.get('dificultad'),
        "asignado": data.get('asignado'),
        "estado": data.get('estado')
    }
    
    tareas.append(nueva_tarea)
    print(f"Nueva tarea: {nueva_tarea['nombre']} ({nueva_tarea['estado']})")
    
    return jsonify({
        "message": "Tarea creada con éxito",
        "tarea": nueva_tarea
    }), 201

# --- NUEVA RUTA PARA ELIMINAR ---
@app.route('/tareas/<int:id_tarea>', methods=['DELETE'])
def eliminar_tarea(id_tarea):
    global tareas
    # Filtramos la lista: mantenemos todas las tareas cuyo ID sea DISTINTO al que queremos borrar
    tareas_filtradas = [t for t in tareas if t['id'] != id_tarea]
    
    # Verificamos si se borró algo (opcional, pero buena práctica)
    if len(tareas) == len(tareas_filtradas):
         return jsonify({"message": "Tarea no encontrada"}), 404
         
    tareas = tareas_filtradas
    return jsonify({"message": "Tarea eliminada correctamente"}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)