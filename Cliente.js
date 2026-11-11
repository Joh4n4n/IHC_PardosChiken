
/* =====================================================
   CENTRO DE AYUDA DEL CLIENTE
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    const preguntas = document.querySelectorAll(".pregunta_ayuda");
    const botones = document.querySelectorAll(".categoria_ayuda");
    const buscador = document.getElementById("buscarAyuda");

    let categoriaActual = "todos";
    let textoBusqueda = "";

    /* ABRIR Y CERRAR PREGUNTAS */

    preguntas.forEach(pregunta => {

        const boton = pregunta.querySelector(".pregunta_boton");
        const respuesta = pregunta.querySelector(".respuesta_ayuda");
        const icono = boton?.querySelector("span");

        if (!boton || !respuesta) return;

        boton.addEventListener("click", () => {

            const estabaAbierta = pregunta.classList.contains("abierta");

            // Cerrar las demás preguntas
            preguntas.forEach(item => {

                item.classList.remove("abierta");

                const respuestaItem = item.querySelector(".respuesta_ayuda");
                const iconoItem = item.querySelector(".pregunta_boton span");

                if (respuestaItem) respuestaItem.style.display = "none";
                if (iconoItem) iconoItem.textContent = "+";

            });

            // Abrir la pregunta seleccionada
            if (!estabaAbierta) {

                pregunta.classList.add("abierta");
                respuesta.style.display = "block";

                if (icono) icono.textContent = "−";

            }

        });

    });

    /* FILTRAR PREGUNTAS */

    function filtrarPreguntas() {

        preguntas.forEach(pregunta => {

            const categoria = pregunta.dataset.tipo || "";

            const contenido = pregunta.textContent.toLowerCase();

            const coincideCategoria =
                categoriaActual === "todos" ||
                categoria === categoriaActual;

            const coincideBusqueda =
                contenido.includes(textoBusqueda);

            const mostrar = coincideCategoria && coincideBusqueda;

            pregunta.style.display = mostrar ? "block" : "none";

            // Cerrar preguntas que no coinciden
            if (!mostrar) {

                pregunta.classList.remove("abierta");

                const respuesta = pregunta.querySelector(".respuesta_ayuda");
                const icono = pregunta.querySelector(".pregunta_boton span");

                if (respuesta) respuesta.style.display = "none";
                if (icono) icono.textContent = "+";

            }

        });

    }

    /* BOTONES DE CATEGORÍAS */

    botones.forEach(boton => {

        boton.addEventListener("click", () => {

            botones.forEach(item => {
                item.classList.remove("activa");
            });

            boton.classList.add("activa");

            categoriaActual = boton.dataset.categoria || "todos";

            filtrarPreguntas();

        });

    });

    /* BUSCADOR */

    if (buscador) {

        buscador.addEventListener("input", () => {

            textoBusqueda = buscador.value.trim().toLowerCase();

            filtrarPreguntas();

        });

    }

    /* INICIALIZAR */

    preguntas.forEach(pregunta => {

        const respuesta = pregunta.querySelector(".respuesta_ayuda");

        if (respuesta) {
            respuesta.style.display = "none";
        }

    });

    filtrarPreguntas();

});
