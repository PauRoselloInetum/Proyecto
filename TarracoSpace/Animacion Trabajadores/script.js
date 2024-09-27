const fotos = document.querySelectorAll('.foto');

if(window.innerWidth > 1200){
// Añadir eventos de mouseover y mouseout para cada elemento .foto
fotos.forEach((foto) => {
    const circle = foto.querySelector('.circle'); // Selecciona el círculo dentro del div hijo

    foto.addEventListener('mouseover', () => {
        // Ocultar todos los divs excepto el que tiene el hover
        fotos.forEach(f => {
            if (f !== foto) {
                f.style.flexGrow = '0'; // Reduce el tamaño de los otros divs
                f.style.opacity = '0'; // Oculta el div
                f.style.pointerEvents = 'none'; // Evita interacciones con los divs ocultos
                f.style.zIndex = '0'; // Asegura que otros divs queden atrás
            } else {
                f.style.flexGrow = '1'; // El elemento en hover ocupa todo el espacio
                f.style.opacity = '1'; // Asegura que el div en hover esté visible
                f.style.zIndex = '2'; // Asegura que el div en hover esté en frente
            }
        });

        // No es necesario mover el círculo aquí porque CSS se encarga del cambio en hover
    });

    foto.addEventListener('mouseout', () => {
        // Restaurar todos los divs al salir del hover
        fotos.forEach(f => {
            f.style.flexGrow = '1'; // Restaura el tamaño original de todos los divs
            f.style.opacity = '1'; // Restaura la visibilidad
            f.style.pointerEvents = 'auto'; // Permite interacciones nuevamente
            f.style.zIndex = '1'; // Restaura el índice Z de los divs
        });

        // No es necesario restaurar la posición del círculo porque CSS lo hará automáticamente
    });
});

}

