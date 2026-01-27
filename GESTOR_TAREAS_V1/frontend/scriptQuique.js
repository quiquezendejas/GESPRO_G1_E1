document.addEventListener('DOMContentLoaded', () => {
    const statusIndicator = document.getElementById('status-indicator');

    // URL de tu backend Flask (asegúrate de que app.py esté corriendo)
    const backendUrl = 'http://127.0.0.1:5000/health';

    fetch(backendUrl)
        .then(response => {
            if (!response.ok) throw new Error('Error en la respuesta del servidor');
            return response.json();
        })
        .then(data => {
            // Si conecta con éxito
            statusIndicator.textContent = `Conectado: ${data.message}`;
            statusIndicator.className = 'status-box online';
        })
        .catch(error => {
            // Si el backend no está encendido o hay un error
            statusIndicator.textContent = 'Error: No se pudo conectar con el backend (¿Está Flask corriendo?)';
            statusIndicator.className = 'status-box offline';
            console.error('Error de conexión:', error);
        });
});