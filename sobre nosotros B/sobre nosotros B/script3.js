const fotos = document.querySelectorAll('.foto');

// Añadir eventos de mouseover y mouseout para cada círculo
fotos.forEach((foto) => {
    const circle = foto.querySelector('.circle'); // Selecciona el círculo dentro del div hijo

    foto.addEventListener('mouseover', () => {
        // Ocultar todos los divs excepto el que tiene el hover
        fotos.forEach(f => {
            if (f !== foto) {
                f.style.opacity = '0'; // Oculta el div
                f.style.pointerEvents = 'none'; // Evita interacciones con los divs ocultos
                f.style.zIndex = '0'; // Asegura que otros divs queden atrás
            } else {
                f.style.opacity = '1'; // Asegura que el div en hover esté visible
                f.style.zIndex = '2'; // Asegura que el div en hover esté en frente
            }
        });

        // Obtener la posición del primer hijo
        const firstFoto = fotos[0];
        const firstFotoRect = firstFoto.getBoundingClientRect();
        const circleRect = circle.getBoundingClientRect();

        // Calcular el desplazamiento
        const offsetX = firstFotoRect.left + (firstFotoRect.width / 2) - (circleRect.left + (circleRect.width / 2));
        const offsetY = firstFotoRect.top + (firstFotoRect.height / 2) - (circleRect.top + (circleRect.height / 2));

        // Mover el círculo hacia la posición del primer hijo
        circle.style.transform = `translate(${offsetX}px, ${offsetY}px)`; // Desplazar al primer hijo
    });

    foto.addEventListener('mouseout', () => {
        // Mostrar todos los divs al salir del hover
        fotos.forEach(f => {
            f.style.opacity = '1'; // Restaura la visibilidad
            f.style.pointerEvents = 'auto'; // Permite interacciones nuevamente
            f.style.zIndex = '1'; // Restaura el índice Z de los divs
        });

        // Restaura la posición original del círculo
        circle.style.transform = 'translate(-50%, -50%)'; // Restaura el centro del círculo
    });
});
