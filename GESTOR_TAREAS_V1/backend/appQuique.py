from flask import Flask, jsonify
from flask_cors import CORS  # <--- 1. Importar esto

app = Flask(__name__)
CORS(app) # <--- 2. Activar esto para todas las rutas

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"message": "Conectado al backend"})

if __name__ == '__main__':
    app.run(debug=True)