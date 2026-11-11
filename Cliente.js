
/*
ayuda
*/

document.addEventListener("DOMContentLoaded", () => {

    const preguntas = document.querySelectorAll(".pregunta_ayuda");
    const botones = document.querySelectorAll(".categoria_ayuda");
    const buscador = document.getElementById("buscarAyuda");

    // ABRIR Y CERRAR PREGUNTAS
    preguntas.forEach(pregunta => {
        const boton = pregunta.querySelector(".pregunta_boton");

        boton.addEventListener("click", () => {
            pregunta.classList.toggle("abierta");

            const icono = boton.querySelector("span");
            icono.textContent = pregunta.classList.contains("abierta")
                ? "−"
                : "+";
        });
    });

    // FILTRAR POR CATEGORÍA
    botones.forEach(boton => {
        boton.addEventListener("click", () => {

            botones.forEach(b => b.classList.remove("activa"));
            boton.classList.add("activa");

            const categoria = boton.dataset.categoria;

            preguntas.forEach(pregunta => {
                pregunta.style.display =
                    categoria === "todos" ||
                    pregunta.dataset.tipo === categoria
                        ? "block"
                        : "none";
            });
        });
    });

    // BUSCADOR DE PREGUNTAS
    buscador.addEventListener("input", () => {

        const texto = buscador.value.toLowerCase();

        preguntas.forEach(pregunta => {
            const contenido = pregunta.textContent.toLowerCase();

            pregunta.style.display = contenido.includes(texto)
                ? "block"
                : "none";
        });

    });

});
