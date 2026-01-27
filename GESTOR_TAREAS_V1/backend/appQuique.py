from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Simulación de BD
tasks = []

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "online",
        "message": "Backend funcionando correctamente"
    }), 200

@app.route('/tasks', methods=['GET'])
def get_tasks():
    return jsonify(tasks), 200

@app.route('/tasks', methods=['POST'])
def create_task():
    data = request.json
    task = {
        "name": data.get("name")
    }
    tasks.append(task)
    return jsonify(task), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)
