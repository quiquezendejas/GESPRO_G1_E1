from flask import Flask, jsonify
from flask_cors import CORS # Importante para que el frontend pueda conectar

app = Flask(__name__)
CORS(app) # Permite peticiones desde el frontend

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        "status": "online",
        "message": "Backend funcionando correctamente"
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)