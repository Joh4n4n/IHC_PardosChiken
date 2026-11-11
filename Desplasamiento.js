
const botones = document.querySelectorAll(".btn_opcion");
const secciones = document.querySelectorAll(".seccion");

botones.forEach(boton => {

    boton.addEventListener("click", () => {

        // Quitar selección anterior
        botones.forEach(btn => {
            btn.classList.remove("activo");
        });

        // Activar botón seleccionado
        boton.classList.add("activo");

        // Obtener sección seleccionada
        const nombreSeccion = boton.dataset.seccion;

        // Ocultar todas las secciones
        secciones.forEach(seccion => {
            seccion.classList.remove("activa");
        });

        // Mostrar sección correspondiente
        document.getElementById(nombreSeccion)
            .classList.add("activa");

    });

});

// Cerrar sesión
document.querySelector(".btn_cerrar")
    .addEventListener("click", () => {

        const confirmar = confirm("¿Deseas cerrar sesión?");

        if (confirmar) {
            alert("Sesión finalizada");
        }

    });
