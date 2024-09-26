const fotos = document.querySelectorAll('.foto');

// Añadir eventos de mouseover y mouseout
fotos.forEach(foto => {
    foto.addEventListener('mouseover', () => {
        // Ocultar todos los divs excepto el que tiene el hover
        fotos.forEach(f => {
            if (f !== foto) {
                f.style.opacity = '0'; // Oculta el div
                f.style.position = 'absolute'; // Cambia la posición a absoluta
                f.style.width = '0'; // Cambia el ancho a 0
            } else {
                f.style.opacity = '1'; // Asegura que el div en hover esté visible
                f.style.position = 'relative'; // Restaura la posición
                f.style.width = '100%'; // Establece el ancho del div en hover al 100%
            }
        });
    });

    foto.addEventListener('mouseout', () => {
        // Mostrar todos los divs al salir del hover
        fotos.forEach(f => {
            f.style.opacity = '1'; // Restaura la visibilidad
            f.style.position = ''; // Restaura la posición al valor por defecto
            f.style.width = ''; // Restaura el ancho al valor por defecto
        });
    });
});