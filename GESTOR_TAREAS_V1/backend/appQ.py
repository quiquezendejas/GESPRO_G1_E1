from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
# Habilita CORS para permitir peticiones desde tu frontend (indexQuique.html)
CORS(app)

# Base de datos temporal en memoria (se reinicia si detienes el servidor)
tareas = []

@app.route('/health', methods=['GET'])
def health_check():
    """Endpoint de prueba para verificar que el servidor está activo."""
    return jsonify({
        "status": "online",
        "message": "Servidor de GESPRO G1_E1 funcionando"
    }), 200

@app.route('/tareas', methods=['GET'])
def obtener_tareas():
    """Devuelve la lista de todas las tareas registradas."""
    return jsonify(tareas), 200

@app.route('/tareas', methods=['POST'])
def crear_tarea():
    """Recibe los datos del formulario y los guarda en la lista."""
    data = request.get_json()
    
    # Estructura basada en tus requerimientos
    nueva_tarea = {
        "id": len(tareas) + 1,
        "nombre": data.get('nombre'),
        "descripcion": data.get('descripcion'),
        "dificultad": data.get('dificultad'),
        "asignado": data.get('asignado'),
        "estado": data.get('estado') # 'to do', 'in progress', o 'done'
    }
    
    tareas.append(nueva_tarea)
    
    # Imprime en la consola de VS Code para que veas la actividad en tiempo real
    print(f"Nueva tarea recibida: {nueva_tarea['nombre']} ({nueva_tarea['estado']})")
    
    return jsonify({
        "message": "Tarea creada con éxito",
        "tarea": nueva_tarea
    }), 201

if __name__ == '__main__':
    # El modo debug permite que el servidor se reinicie solo al detectar cambios
    app.run(debug=True, port=5000)