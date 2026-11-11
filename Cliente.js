
const formularioReserva = document.getElementById("formularioReserva");

if (formularioReserva) {

    const fechaReserva = document.getElementById("fechaReserva");

    // Evitar seleccionar fechas anteriores a hoy
    const hoy = new Date();
    const fechaLocal = new Date(
        hoy.getTime() - hoy.getTimezoneOffset() * 60000
    ).toISOString().split("T")[0];

    fechaReserva.min = fechaLocal;

    formularioReserva.addEventListener("submit", function(e) {
        e.preventDefault();

        const datos = new FormData(formularioReserva);

        const nombre = datos.get("nombre");
        const fecha = datos.get("fecha");
        const hora = datos.get("hora");
        const personas = datos.get("personas");

        alert(
            "¡Solicitud de reserva registrada!\n\n" +
            "Nombre: " + nombre + "\n" +
            "Fecha: " + fecha + "\n" +
            "Hora: " + hora + "\n" +
            "Personas: " + personas
        );

        formularioReserva.reset();
    });
}
// Mesas

const mesasDisponibles = document.querySelectorAll(
    ".tarjeta_mesa.disponible"
);

const mesaSeleccion = document.getElementById("mesaSeleccion");
const detalleMesa = document.getElementById("detalleMesa");
const btnReservarMesa = document.getElementById("btnReservarMesa");

let mesaElegida = null;

mesasDisponibles.forEach(mesa => {

    mesa.addEventListener("click", () => {

        document.querySelectorAll(".tarjeta_mesa")
            .forEach(item => item.classList.remove("seleccionada"));

        mesa.classList.add("seleccionada");

        mesaElegida = {
            numero: mesa.dataset.numero,
            capacidad: mesa.dataset.capacidad
        };

        detalleMesa.textContent =
            `Mesa ${mesaElegida.numero} - ${mesaElegida.capacidad} personas`;

        mesaSeleccion.hidden = false;
    });

});

btnReservarMesa.addEventListener("click", () => {

    if (!mesaElegida) return;

    // Guardar la mesa seleccionada en el formulario de reserva
    const campoMesa = document.getElementById("mesaElegida");

    if (campoMesa) {
        campoMesa.value = mesaElegida.numero;
    }

    // Ir a la sección Reserva
    const botonReserva = document.querySelector(
        '.btn_opcion[data-seccion="asistencia"]'
    );

    if (botonReserva) {
        botonReserva.click();
    }

});
/* Usuarios Cuenta*/

/* ==========================================
   MI CUENTA - PANEL CLIENTE
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    const formularioCuenta = document.getElementById("formularioCuenta");
    const btnEditar = document.getElementById("btnEditarCuenta");
    const btnCancelar = document.getElementById("btnCancelarCuenta");
    const acciones = document.getElementById("accionesCuenta");

    const campos = [
        "cuentaNombre",
        "cuentaTelefono",
        "cuentaCorreo",
        "cuentaFecha"
    ];

    const fotoPerfil = document.getElementById("fotoPerfil");
    const cambiarFoto = document.getElementById("cambiarFoto");

    // CARGAR INFORMACIÓN GUARDADA

    function cargarCuenta() {

        const cuenta = JSON.parse(
            localStorage.getItem("datosCuentaCliente") || "{}"
        );

        document.getElementById("cuentaNombre").value =
            cuenta.nombre || "";

        document.getElementById("cuentaTelefono").value =
            cuenta.telefono || "";

        document.getElementById("cuentaCorreo").value =
            cuenta.correo || "";

        document.getElementById("cuentaFecha").value =
            cuenta.fecha || "";

        document.getElementById("nombrePerfil").textContent =
            cuenta.nombre || "Cliente";

        document.getElementById("correoPerfil").textContent =
            cuenta.correo || "Agrega tu correo";

        if (cuenta.foto) {
            fotoPerfil.src = cuenta.foto;
        }

        // NOTIFICACIONES

        const notificaciones = JSON.parse(
            localStorage.getItem("notificacionesCliente") || "{}"
        );

        document.getElementById("notificarPedidos").checked =
            notificaciones.pedidos !== false;

        document.getElementById("notificarReservas").checked =
            notificaciones.reservas !== false;
    }

    cargarCuenta();

    // ACTIVAR EDICIÓN

    function activarEdicion(activar) {

        campos.forEach(id => {
            document.getElementById(id).disabled = !activar;
        });

        acciones.hidden = !activar;
        btnEditar.hidden = activar;
    }

    btnEditar.addEventListener("click", () => {
        activarEdicion(true);
    });

    // CANCELAR EDICIÓN

    btnCancelar.addEventListener("click", () => {
        cargarCuenta();
        activarEdicion(false);
    });

    // GUARDAR DATOS

    formularioCuenta.addEventListener("submit", (e) => {

        e.preventDefault();

        const cuenta = {
            nombre: document.getElementById("cuentaNombre").value.trim(),
            telefono: document.getElementById("cuentaTelefono").value.trim(),
            correo: document.getElementById("cuentaCorreo").value.trim(),
            fecha: document.getElementById("cuentaFecha").value,
            foto: fotoPerfil.src.startsWith("data:")
                ? fotoPerfil.src
                : null
        };

        if (!cuenta.nombre || !cuenta.telefono || !cuenta.correo) {
            alert("Completa todos los campos obligatorios.");
            return;
        }

        const cuentaAnterior = JSON.parse(
            localStorage.getItem("datosCuentaCliente") || "{}"
        );

        // Conservar la foto anterior si no se ha cambiado.
        if (!cuenta.foto && cuentaAnterior.foto) {
            cuenta.foto = cuentaAnterior.foto;
        }

        localStorage.setItem(
            "datosCuentaCliente",
            JSON.stringify(cuenta)
        );

        cargarCuenta();
        activarEdicion(false);

        alert("Tus datos se guardaron correctamente.");
    });

    // CAMBIAR FOTO DE PERFIL

    cambiarFoto.addEventListener("change", () => {

        const archivo = cambiarFoto.files[0];

        if (!archivo) return;

        if (!archivo.type.startsWith("image/")) {
            alert("Selecciona una imagen válida.");
            cambiarFoto.value = "";
            return;
        }

        if (archivo.size > 2 * 1024 * 1024) {
            alert("La imagen no debe superar los 2 MB.");
            cambiarFoto.value = "";
            return;
        }

        const lector = new FileReader();

        lector.onload = (e) => {

            fotoPerfil.src = e.target.result;

            const cuenta = JSON.parse(
                localStorage.getItem("datosCuentaCliente") || "{}"
            );

            cuenta.foto = e.target.result;

            localStorage.setItem(
                "datosCuentaCliente",
                JSON.stringify(cuenta)
            );

            alert("Foto de perfil actualizada.");
        };

        lector.readAsDataURL(archivo);
    });

    // MOSTRAR FORMULARIO DE CONTRASEÑA

    const btnMostrarPassword =
        document.getElementById("btnMostrarPassword");

    const formularioPassword =
        document.getElementById("formularioPassword");

    btnMostrarPassword.addEventListener("click", () => {

        formularioPassword.hidden = !formularioPassword.hidden;

        btnMostrarPassword.textContent =
            formularioPassword.hidden ? "Cambiar" : "Cancelar";
    });

    // VALIDAR FORMULARIO DE CONTRASEÑA

    formularioPassword.addEventListener("submit", (e) => {

        e.preventDefault();

        const actual = document.getElementById("passwordActual").value;
        const nueva = document.getElementById("passwordNueva").value;
        const confirmar = document.getElementById("passwordConfirmar").value;

        if (!actual || !nueva || !confirmar) {
            alert("Completa todos los campos.");
            return;
        }

        if (nueva.length < 8) {
            alert("La nueva contraseña debe tener al menos 8 caracteres.");
            return;
        }

        if (nueva !== confirmar) {
            alert("Las contraseñas nuevas no coinciden.");
            return;
        }

        alert(
            "La validación visual está lista. Para cambiar realmente tu contraseña necesitas conectar el formulario con tu sistema de autenticación."
        );

        formularioPassword.reset();
        formularioPassword.hidden = true;
        btnMostrarPassword.textContent = "Cambiar";
    });

    // GUARDAR PREFERENCIAS DE NOTIFICACIONES

    function guardarNotificaciones() {

        const notificaciones = {
            pedidos: document.getElementById("notificarPedidos").checked,
            reservas: document.getElementById("notificarReservas").checked
        };

        localStorage.setItem(
            "notificacionesCliente",
            JSON.stringify(notificaciones)
        );
    }

    document.getElementById("notificarPedidos")
        .addEventListener("change", guardarNotificaciones);

    document.getElementById("notificarReservas")
        .addEventListener("change", guardarNotificaciones);

    // CERRAR SESIÓN

    document.getElementById("btnCerrarCuenta")
        .addEventListener("click", () => {

            const confirmar = confirm("¿Estás seguro de que deseas cerrar sesión?");

            if (confirmar) {
                sessionStorage.clear();

                alert("Has solicitado cerrar sesión. Conecta esta acción con tu sistema de inicio de sesión para finalizarla.");
            }
        });

});
