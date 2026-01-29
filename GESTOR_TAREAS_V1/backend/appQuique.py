from flask import Flask, jsonify, render_template # Añadimos render_template
from flask_cors import CORS

# Indicamos a Flask que los HTML están en la carpeta 'frontend'
app = Flask(__name__, template_folder='../../frontend') 
CORS(app)

@app.route('/')
def index():
    # Esta función busca el archivo en la carpeta 'frontend' y lo muestra al usuario
    return render_template('indexQuique.html')

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"message": "Conectado al backend"})

if __name__ == '__main__':
    app.run(debug=True)