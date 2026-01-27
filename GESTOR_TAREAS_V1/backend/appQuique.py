from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# 🧠 Simulación de base de datos
tasks = [
    {"id": 1, "name": "Configurar proyecto"},
    {"id": 2, "name": "Crear backend mínimo"}
]

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "online",
        "message": "Backend funcionando correctamente"
    }), 200

# ✅ GET /tasks
@app.route('/tasks', methods=['GET'])
def get_tasks():
    return jsonify(tasks), 200

# (opcional, lo dejamos para después)
@app.route('/tasks', methods=['POST'])
def create_task():
    data = request.json
    new_task = {
        "id": len(tasks) + 1,
        "name": data.get("name")
    }
    tasks.append(new_task)
    return jsonify(new_task), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)
