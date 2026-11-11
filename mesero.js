
/* =====================================================
   MESERO.JS
   FUNCIONALIDADES COMPLETAS DEL PANEL DEL MESERO
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       1. CONFIGURACIÓN Y ALMACENAMIENTO
    ===================================================== */

    const CLAVE_CARTA = "cartaRestaurante";
    const CLAVE_CATEGORIAS = "categoriasRestaurante";
    const CLAVE_PEDIDOS = "pedidosCliente";
    const CLAVE_MESAS = "mesasRestaurante";
    const CLAVE_RESERVAS = "reservasCliente";
    const CLAVE_ASISTENCIA = "asistenciaMesero";
    const CLAVE_CUENTA = "cuentaMesero";
    const CLAVE_PAGOS = "pagosRestaurante";

    const obtenerDatos = (clave, valorInicial = []) => {
        try {
            const datos = localStorage.getItem(clave);
            return datos ? JSON.parse(datos) : valorInicial;
        } catch (error) {
            console.error("Error leyendo:", clave, error);
            return valorInicial;
        }
    };

    const guardarDatos = (clave, datos) => {
        try {
            localStorage.setItem(clave, JSON.stringify(datos));
            return true;
        } catch (error) {
            console.error("Error guardando:", clave, error);
            mostrarMensaje("No se pudieron guardar los datos. Revisa el almacenamiento.");
            return false;
        }
    };

    const escaparHTML = texto => {
        return String(texto ?? "").replace(/[&<>"']/g, caracter => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[caracter]);
    };

    const formatoMoneda = cantidad => {
        return "S/ " + Number(cantidad || 0).toFixed(2);
    };

    const fechaActual = () => {
        return new Date().toLocaleDateString("es-PE");
    };

    const horaActual = () => {
        return new Date().toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });
    };

    const crearId = () => {
        return Date.now() + Math.floor(Math.random() * 1000);
    };

    const mostrarMensaje = mensaje => {
        alert(mensaje);
    };

    const normalizarMesa = numero => {
        const numeroLimpio = String(numero || "").replace(/\D/g, "");
        return numeroLimpio.padStart(2, "0");
    };

    /* =====================================================
       2. VARIABLES GENERALES
    ===================================================== */

    let productos = obtenerDatos(CLAVE_CARTA, []);
    let categorias = obtenerDatos(CLAVE_CATEGORIAS, [
        "Entradas",
        "Platos principales",
        "Bebidas",
        "Postres"
    ]);

    let pedidos = obtenerDatos(CLAVE_PEDIDOS, []);
    let mesas = obtenerDatos(CLAVE_MESAS, []);
    let reservas = obtenerDatos(CLAVE_RESERVAS, []);
    let asistencia = obtenerDatos(CLAVE_ASISTENCIA, []);
    let pagos = obtenerDatos(CLAVE_PAGOS, []);

    if (!Array.isArray(productos)) productos = [];
    if (!Array.isArray(categorias)) categorias = [];
    if (!Array.isArray(pedidos)) pedidos = [];
    if (!Array.isArray(mesas)) mesas = [];
    if (!Array.isArray(reservas)) reservas = [];
    if (!Array.isArray(asistencia)) asistencia = [];
    if (!Array.isArray(pagos)) pagos = [];

    let filtroPedidoActual = "todos";
    let filtroMesaActual = "todos";
    let filtroCartaActual = "todos";

    /* =====================================================
       3. PEDIDOS
    ===================================================== */

    const listaPedidos = document.getElementById("listaPedidos");

    function obtenerEstadoPedido(pedido) {
        return pedido.estado || "Pendiente";
    }

    function actualizarResumenPedidos() {

        const pendientes = pedidos.filter(p =>
            obtenerEstadoPedido(p) === "Pendiente"
        ).length;

        const preparacion = pedidos.filter(p =>
            obtenerEstadoPedido(p) === "En preparación"
        ).length;

        const listos = pedidos.filter(p =>
            obtenerEstadoPedido(p) === "Listo"
        ).length;

        const totalPendientes = document.getElementById("totalPendientes");
        const totalPreparacion = document.getElementById("totalPreparacion");
        const totalListos = document.getElementById("totalListos");

        if (totalPendientes) totalPendientes.textContent = pendientes;
        if (totalPreparacion) totalPreparacion.textContent = preparacion;
        if (totalListos) totalListos.textContent = listos;
    }

    function renderizarPedidos() {

        pedidos = obtenerDatos(CLAVE_PEDIDOS, []);

        if (!Array.isArray(pedidos)) pedidos = [];

        actualizarResumenPedidos();

        if (!listaPedidos) return;

        const pedidosFiltrados = pedidos.filter(pedido => {

            if (filtroPedidoActual === "todos") return true;

            return obtenerEstadoPedido(pedido).toLowerCase() ===
                filtroPedidoActual.toLowerCase();
        });

        if (pedidosFiltrados.length === 0) {
            listaPedidos.innerHTML = `
                <div class="mensaje_vacio">
                    No hay pedidos para mostrar.
                </div>
            `;
            return;
        }

        listaPedidos.innerHTML = pedidosFiltrados.map(pedido => {

            const estado = obtenerEstadoPedido(pedido);

            const productosPedido = Array.isArray(pedido.productos)
                ? pedido.productos
                : [];

            const detalle = productosPedido.map(producto => {
                return `${escaparHTML(producto.nombre)} x${Number(producto.cantidad || 1)}`;
            }).join(", ");

            const siguienteEstado = {
                "Pendiente": "En preparación",
                "En preparación": "Listo",
                "Listo": "Entregado",
                "Entregado": "Pendiente"
            };

            const textoBoton = {
                "Pendiente": "Preparar pedido",
                "En preparación": "Marcar como listo",
                "Listo": "Entregar pedido",
                "Entregado": "Reabrir pedido"
            };

            const claseEstado = {
                "Pendiente": "pendiente",
                "En preparación": "preparacion",
                "Listo": "listo",
                "Entregado": "entregado"
            };

            return `
                <article class="tarjeta_pedido">

                    <div class="imagen_plato">
                        🍽️
                    </div>

                    <div class="datos_pedido">

                        <strong>
                            Pedido #${escaparHTML(pedido.id)}
                        </strong>

                        <span>
                            Mesa: ${escaparHTML(pedido.mesa || "No especificada")}
                        </span>

                        <span>
                            ${detalle || "Sin detalle de productos"}
                        </span>

                        <span>
                            Total: ${formatoMoneda(pedido.total)}
                        </span>

                        <span>
                            ${escaparHTML(pedido.fecha || "")}
                        </span>

                        <div>
                            <button
                                type="button"
                                class="btn_cambiar_estado"
                                data-id="${escaparHTML(pedido.id)}"
                            >
                                ${textoBoton[estado] || "Cambiar estado"}
                            </button>
                        </div>

                    </div>

                    <span class="estado ${claseEstado[estado] || "pendiente"}">
                        ${escaparHTML(estado)}
                    </span>

                </article>
            `;

        }).join("");
    }

    if (listaPedidos) {

        listaPedidos.addEventListener("click", event => {

            const boton = event.target.closest(".btn_cambiar_estado");

            if (!boton) return;

            pedidos = obtenerDatos(CLAVE_PEDIDOS, []);

            const pedido = pedidos.find(p =>
                String(p.id) === String(boton.dataset.id)
            );

            if (!pedido) return;

            const estados = [
                "Pendiente",
                "En preparación",
                "Listo",
                "Entregado"
            ];

            const estadoActual = obtenerEstadoPedido(pedido);
            const indice = estados.indexOf(estadoActual);

            pedido.estado = estados[(indice + 1) % estados.length];

            guardarDatos(CLAVE_PEDIDOS, pedidos);

            renderizarPedidos();
            renderizarMesas();
            renderizarPagos();
        });
    }

    document.querySelectorAll(".filtro").forEach(boton => {

        boton.addEventListener("click", () => {

            document.querySelectorAll(".filtro").forEach(b => {
                b.classList.remove("activo");
            });

            boton.classList.add("activo");

            filtroPedidoActual = boton.dataset.filtro || "todos";

            renderizarPedidos();
        });
    });

    /* =====================================================
       4. MESAS
    ===================================================== */

    const listaMesas = document.getElementById("listaMesas");

    const mesasIniciales = Array.from({ length: 8 }, (_, i) => ({
        id: String(i + 1).padStart(2, "0"),
        numero: String(i + 1).padStart(2, "0"),
        estado: "Disponible"
    }));

    if (mesas.length === 0) {
        mesas = mesasIniciales;
        guardarDatos(CLAVE_MESAS, mesas);
    }

    function actualizarEstadoMesas() {

        pedidos = obtenerDatos(CLAVE_PEDIDOS, []);
        reservas = obtenerDatos(CLAVE_RESERVAS, []);
        mesas = obtenerDatos(CLAVE_MESAS, mesasIniciales);

        if (!Array.isArray(mesas)) mesas = mesasIniciales;
        if (!Array.isArray(pedidos)) pedidos = [];
        if (!Array.isArray(reservas)) reservas = [];

        mesas.forEach(mesa => {

            const numeroMesa = normalizarMesa(mesa.numero || mesa.id);

            const pedidoActivo = pedidos.some(p => {

                const numeroPedido = normalizarMesa(p.mesa);

                return numeroPedido === numeroMesa &&
                    obtenerEstadoPedido(p) !== "Entregado";
            });

            const reservaActiva = reservas.some(reserva => {

                if (!reserva.mesa) return false;

                const numeroReserva = normalizarMesa(reserva.mesa);

                const estadoReserva = String(reserva.estado || "Pendiente")
                    .toLowerCase();

                return numeroReserva === numeroMesa &&
                    !["cancelada", "rechazada", "finalizada"].includes(estadoReserva);
            });

            if (pedidoActivo) {
                mesa.estado = "Ocupada";
            } else if (reservaActiva) {
                mesa.estado = "Reservada";
            } else if (
                mesa.estado !== "Disponible" &&
                mesa.estado !== "Ocupada" &&
                mesa.estado !== "Reservada"
            ) {
                mesa.estado = "Disponible";
            } else if (
                mesa.estado === "Ocupada" &&
                !pedidoActivo
            ) {
                mesa.estado = "Disponible";
            } else if (
                mesa.estado === "Reservada" &&
                !reservaActiva
            ) {
                mesa.estado = "Disponible";
            }
        });

        guardarDatos(CLAVE_MESAS, mesas);
    }

    function actualizarSelectorMesas() {

        const selectorQR = document.getElementById("seleccionarMesaQR");
        const selectorPago = document.getElementById("seleccionarMesaPago");

        [selectorQR, selectorPago].forEach(selector => {

            if (!selector) return;

            const valorAnterior = selector.value;

            selector.innerHTML = `
                <option value="">Seleccionar mesa</option>

                ${mesas.map(mesa => `
                    <option value="${escaparHTML(mesa.numero || mesa.id)}">
                        Mesa ${escaparHTML(mesa.numero || mesa.id)}
                    </option>
                `).join("")}
            `;

            if ([...selector.options].some(op => op.value === valorAnterior)) {
                selector.value = valorAnterior;
            }
        });
    }

    function renderizarMesas() {

        if (!listaMesas) {
            actualizarEstadoMesas();
            actualizarSelectorMesas();
            return;
        }

        actualizarEstadoMesas();

        const filtradas = mesas.filter(mesa => {

            if (filtroMesaActual === "todos") return true;

            return String(mesa.estado).toLowerCase() ===
                filtroMesaActual.toLowerCase();
        });

        const disponibles = mesas.filter(m => m.estado === "Disponible").length;
        const ocupadas = mesas.filter(m => m.estado === "Ocupada").length;
        const reservadas = mesas.filter(m => m.estado === "Reservada").length;

        const elDisponibles = document.getElementById("mesasDisponibles");
        const elOcupadas = document.getElementById("mesasOcupadas");
        const elReservadas = document.getElementById("mesasReservadas");

        if (elDisponibles) elDisponibles.textContent = disponibles;
        if (elOcupadas) elOcupadas.textContent = ocupadas;
        if (elReservadas) elReservadas.textContent = reservadas;

        if (filtradas.length === 0) {
            listaMesas.innerHTML = `
                <div class="mensaje_vacio">
                    No hay mesas en esta categoría.
                </div>
            `;

            actualizarSelectorMesas();
            return;
        }

        listaMesas.innerHTML = filtradas.map(mesa => {

            const numero = mesa.numero || mesa.id;

            const color = {
                "Disponible": "#dff4df",
                "Ocupada": "#fff0d8",
                "Reservada": "#dcecff"
            };

            return `
                <article class="tarjeta_mesa">

                    <h3>Mesa ${escaparHTML(numero)}</h3>

                    <p style="
                        display:inline-block;
                        background:${color[mesa.estado] || "#eee"};
                        padding:6px 12px;
                        border-radius:20px;
                        margin:10px 0;
                        color:#333;
                    ">
                        ${escaparHTML(mesa.estado)}
                    </p>

                    <p>Código QR individual</p>

                </article>
            `;

        }).join("");

        actualizarSelectorMesas();
    }

    document.querySelectorAll(".filtro_mesa").forEach(boton => {

        boton.addEventListener("click", () => {

            document.querySelectorAll(".filtro_mesa").forEach(b => {
                b.classList.remove("activo");
            });

            boton.classList.add("activo");

            filtroMesaActual = boton.dataset.filtroMesa || "todos";

            renderizarMesas();
        });
    });

    /* =====================================================
       5. RESERVAS DEL CLIENTE
    ===================================================== */

    const listaReservas = document.getElementById("listaReservas");

    function renderizarReservas() {

        if (!listaReservas) return;

        reservas = obtenerDatos(CLAVE_RESERVAS, []);

        if (!Array.isArray(reservas)) reservas = [];

        if (reservas.length === 0) {

            listaReservas.innerHTML = `
                <div class="mensaje_vacio">
                    Todavía no hay reservas registradas.
                </div>
            `;

            return;
        }

        listaReservas.innerHTML = reservas.slice().reverse().map(reserva => {

            const estado = reserva.estado || "Pendiente";

            return `
                <article class="tarjeta_reserva">

                    <div class="datos_reserva">

                        <strong>
                            Reserva #${escaparHTML(reserva.id || "Nueva")}
                        </strong>

                        <p>
                            Cliente:
                            ${escaparHTML(reserva.nombre || "No especificado")}
                        </p>

                        <p>
                            Teléfono:
                            ${escaparHTML(reserva.telefono || "No especificado")}
                        </p>

                        <p>
                            Fecha:
                            ${escaparHTML(reserva.fecha || "No especificada")}
                        </p>

                        <p>
                            Hora:
                            ${escaparHTML(reserva.hora || "No especificada")}
                        </p>

                        <p>
                            Personas:
                            ${escaparHTML(reserva.personas || "No especificado")}
                        </p>

                        ${reserva.mesa ? `
                            <p>Mesa: ${escaparHTML(reserva.mesa)}</p>
                        ` : ""}

                        <p>
                            Observaciones:
                            ${escaparHTML(reserva.observaciones || "Ninguna")}
                        </p>

                        <p>
                            Estado:
                            <strong>${escaparHTML(estado)}</strong>
                        </p>

                        <div class="acciones_reserva">

                            <button
                                type="button"
                                class="btn_confirmar_reserva"
                                data-id="${escaparHTML(reserva.id)}"
                            >
                                Confirmar
                            </button>

                            <button
                                type="button"
                                class="btn_cancelar_reserva"
                                data-id="${escaparHTML(reserva.id)}"
                            >
                                Cancelar
                            </button>

                        </div>

                    </div>

                </article>
            `;

        }).join("");
    }

    if (listaReservas) {

        listaReservas.addEventListener("click", event => {

            const btnConfirmar = event.target.closest(".btn_confirmar_reserva");
            const btnCancelar = event.target.closest(".btn_cancelar_reserva");

            if (!btnConfirmar && !btnCancelar) return;

            reservas = obtenerDatos(CLAVE_RESERVAS, []);

            const boton = btnConfirmar || btnCancelar;

            const reserva = reservas.find(r =>
                String(r.id) === String(boton.dataset.id)
            );

            if (!reserva) return;

            if (btnConfirmar) {

                reserva.estado = "Confirmada";

                guardarDatos(CLAVE_RESERVAS, reservas);

                mostrarMensaje("Reserva confirmada correctamente.");

            }

            if (btnCancelar) {

                if (!confirm("¿Deseas cancelar esta reserva?")) return;

                reserva.estado = "Cancelada";

                guardarDatos(CLAVE_RESERVAS, reservas);

                mostrarMensaje("Reserva cancelada.");

            }

            renderizarReservas();
            renderizarMesas();
        });
    }

    /* =====================================================
       6. GENERAR Y DESCARGAR QR POR MESA
    ===================================================== */

    const btnGenerarQR = document.getElementById("btnGenerarQR");
    const btnDescargarQR = document.getElementById("btnDescargarQR");

    const codigoQR = document.getElementById("codigoQR");
    const tituloMesaQR = document.getElementById("tituloMesaQR");

    if (btnGenerarQR) {

        btnGenerarQR.addEventListener("click", () => {

            const selector = document.getElementById("seleccionarMesaQR");
            const numeroMesa = selector?.value;

            if (!numeroMesa) {
                mostrarMensaje("Selecciona una mesa primero.");
                return;
            }

            if (typeof QRCode === "undefined") {
                mostrarMensaje("No se pudo cargar la librería de códigos QR.");
                return;
            }

            if (!codigoQR) return;

            codigoQR.innerHTML = "";

            /*
               IMPORTANTE:
               Cambia cliente.html si tu archivo del panel
               de clientes tiene otro nombre.
            */

            const direccion = new URL("cliente.html", window.location.href);

            direccion.search = "";
            direccion.hash = "";

            direccion.searchParams.set("local", "restaurante1");
            direccion.searchParams.set("mesa", numeroMesa);

            const urlQR = direccion.toString();

            new QRCode(codigoQR, {
                text: urlQR,
                width: 200,
                height: 200,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });

            if (tituloMesaQR) {
                tituloMesaQR.textContent = `Código QR - Mesa ${numeroMesa}`;
            }

            codigoQR.dataset.mesa = numeroMesa;
        });
    }

    if (btnDescargarQR) {

        btnDescargarQR.addEventListener("click", () => {

            if (!codigoQR || !codigoQR.innerHTML) {
                mostrarMensaje("Primero genera un código QR.");
                return;
            }

            const imagen = codigoQR.querySelector("img");
            const canvas = codigoQR.querySelector("canvas");

            let enlace;

            if (imagen && imagen.src) {

                enlace = document.createElement("a");
                enlace.href = imagen.src;

            } else if (canvas) {

                enlace = document.createElement("a");
                enlace.href = canvas.toDataURL("image/png");

            } else {

                mostrarMensaje("No se encontró el código QR.");
                return;
            }

            enlace.download = `QR-Mesa-${codigoQR.dataset.mesa || "mesa"}.png`;
            enlace.click();
        });
    }

    /* =====================================================
       7. ADMINISTRAR CARTA
    ===================================================== */

    const formularioProducto = document.getElementById("formularioProducto");
    const listaProductosAdmin = document.getElementById("listaProductosAdmin");
    const formularioCategoria = document.getElementById("formularioCategoria");

    const selectCategoria = document.getElementById("categoriaProducto");

    function guardarCarta() {
        guardarDatos(CLAVE_CARTA, productos);
    }

    function actualizarResumenCarta() {

        const total = productos.length;

        const disponibles = productos.filter(p =>
            p.disponible !== false && p.agotado !== true
        ).length;

        const agotados = productos.filter(p =>
            p.agotado === true && p.disponible !== false
        ).length;

        const deshabilitados = productos.filter(p =>
            p.disponible === false
        ).length;

        const totalProductos = document.getElementById("totalProductos");
        const productosDisponibles = document.getElementById("productosDisponibles");
        const productosAgotados = document.getElementById("productosAgotados");

        if (totalProductos) totalProductos.textContent = total;
        if (productosDisponibles) productosDisponibles.textContent = disponibles;
        if (productosAgotados) {
            productosAgotados.textContent = agotados + deshabilitados;
        }
    }

    function renderizarCategorias() {

        if (selectCategoria) {

            const valorAnterior = selectCategoria.value;

            selectCategoria.innerHTML = `
                <option value="">Seleccionar categoría</option>

                ${categorias.map(categoria => `
                    <option value="${escaparHTML(categoria)}">
                        ${escaparHTML(categoria)}
                    </option>
                `).join("")}
            `;

            if (categorias.includes(valorAnterior)) {
                selectCategoria.value = valorAnterior;
            }
        }

        const listaCategorias = document.getElementById("listaCategorias");

        if (listaCategorias) {

            listaCategorias.innerHTML = categorias.map(categoria => `
                <div class="categoria_item">

                    <span>${escaparHTML(categoria)}</span>

                    <button
                        type="button"
                        class="btn_eliminar_categoria"
                        data-categoria="${escaparHTML(categoria)}"
                    >
                        Eliminar
                    </button>

                </div>
            `).join("");
        }

        guardarDatos(CLAVE_CATEGORIAS, categorias);
    }

    function renderizarProductos() {

        if (!listaProductosAdmin) {
            actualizarResumenCarta();
            return;
        }

        productos = obtenerDatos(CLAVE_CARTA, []);

        if (!Array.isArray(productos)) productos = [];

        const busqueda = (
            document.getElementById("buscarProducto")?.value || ""
        ).toLowerCase().trim();

        const filtrados = productos.filter(producto => {

            const coincideBusqueda =
                String(producto.nombre || "").toLowerCase().includes(busqueda) ||
                String(producto.categoria || "").toLowerCase().includes(busqueda);

            let coincideFiltro = true;

            if (filtroCartaActual === "disponibles") {
                coincideFiltro =
                    producto.disponible !== false &&
                    producto.agotado !== true;
            }

            if (filtroCartaActual === "agotados") {
                coincideFiltro =
                    producto.agotado === true &&
                    producto.disponible !== false;
            }

            if (filtroCartaActual === "deshabilitados") {
                coincideFiltro = producto.disponible === false;
            }

            return coincideBusqueda && coincideFiltro;
        });

        actualizarResumenCarta();

        if (filtrados.length === 0) {

            listaProductosAdmin.innerHTML = `
                <div class="mensaje_vacio">
                    No se encontraron productos.
                </div>
            `;

            return;
        }

        listaProductosAdmin.innerHTML = filtrados.map(producto => {

            let estado = "Disponible";

            if (producto.disponible === false) {
                estado = "Deshabilitado";
            } else if (producto.agotado === true) {
                estado = "Agotado";
            }

            const imagen = producto.imagen
                ? escaparHTML(producto.imagen)
                : "";

            return `
                <article class="producto_admin">

                    ${
                        imagen
                            ? `<img src="${imagen}" alt="${escaparHTML(producto.nombre)}">`
                            : `<div class="imagen_plato">🍽️</div>`
                    }

                    <div>

                        <h3>${escaparHTML(producto.nombre)}</h3>

                        <p>
                            ${escaparHTML(producto.descripcion || "Sin descripción")}
                        </p>

                        <p>
                            Categoría: ${escaparHTML(producto.categoria)}
                        </p>

                        <strong>${formatoMoneda(producto.precio)}</strong>

                        <p>Estado: ${estado}</p>

                        <button
                            type="button"
                            class="btn_editar_producto"
                            data-id="${escaparHTML(producto.id)}"
                        >
                            Editar
                        </button>

                        <button
                            type="button"
                            class="btn_estado_producto"
                            data-id="${escaparHTML(producto.id)}"
                        >
                            ${
                                producto.disponible === false
                                    ? "Habilitar"
                                    : producto.agotado
                                        ? "Marcar disponible"
                                        : "Marcar agotado"
                            }
                        </button>

                        <button
                            type="button"
                            class="btn_deshabilitar_producto"
                            data-id="${escaparHTML(producto.id)}"
                        >
                            ${producto.disponible === false
                                ? "Habilitar producto"
                                : "Deshabilitar"}
                        </button>

                        <button
                            type="button"
                            class="btn_eliminar_producto"
                            data-id="${escaparHTML(producto.id)}"
                        >
                            Eliminar
                        </button>

                    </div>

                </article>
            `;

        }).join("");
    }

    function limpiarFormularioProducto() {

        formularioProducto?.reset();

        const id = document.getElementById("productoId");
        const titulo = document.getElementById("tituloFormularioProducto");
        const botonGuardar = document.getElementById("btnGuardarProducto");
        const botonCancelar = document.getElementById("btnCancelarEdicion");

        if (id) id.value = "";
        if (titulo) titulo.textContent = "Agregar producto";
        if (botonGuardar) botonGuardar.textContent = "Guardar producto";
        if (botonCancelar) botonCancelar.hidden = true;
    }

    if (formularioProducto) {

        formularioProducto.addEventListener("submit", event => {

            event.preventDefault();

            const id = document.getElementById("productoId")?.value;

            const nombre = document.getElementById("nombreProducto")?.value.trim();
            const precio = Number(document.getElementById("precioProducto")?.value);
            const categoria = document.getElementById("categoriaProducto")?.value;
            const imagen = document.getElementById("imagenProducto")?.value.trim();
            const descripcion = document.getElementById("descripcionProducto")?.value.trim();

            const disponibilidad = document.getElementById("disponibilidadProducto")?.value;

            if (
                !nombre ||
                !categoria ||
                !Number.isFinite(precio) ||
                precio <= 0
            ) {
                mostrarMensaje("Completa correctamente los datos del producto. El precio debe ser mayor que cero.");
                return;
            }

            const productoExistente = id
                ? productos.find(p => String(p.id) === String(id))
                : null;

            const producto = {
                id: id || crearId(),
                nombre,
                precio,
                categoria,
                imagen,
                descripcion,
                disponible: disponibilidad !== "false",
                agotado: productoExistente?.agotado || false
            };

            if (producto.disponible === false) {
                producto.agotado = false;
            }

            if (id) {

                productos = productos.map(p =>
                    String(p.id) === String(id) ? producto : p
                );

                mostrarMensaje("Producto actualizado correctamente.");

            } else {

                productos.push(producto);

                mostrarMensaje("Producto agregado correctamente.");
            }

            guardarCarta();
            limpiarFormularioProducto();
            renderizarProductos();
        });
    }

    if (listaProductosAdmin) {

        listaProductosAdmin.addEventListener("click", event => {

            const botonEditar = event.target.closest(".btn_editar_producto");
            const botonEstado = event.target.closest(".btn_estado_producto");
            const botonDeshabilitar = event.target.closest(".btn_deshabilitar_producto");
            const botonEliminar = event.target.closest(".btn_eliminar_producto");

            const boton = botonEditar || botonEstado ||
                botonDeshabilitar || botonEliminar;

            if (!boton) return;

            productos = obtenerDatos(CLAVE_CARTA, []);

            const producto = productos.find(p =>
                String(p.id) === String(boton.dataset.id)
            );

            if (!producto) return;

            if (botonEditar) {

                document.getElementById("productoId").value = producto.id;
                document.getElementById("nombreProducto").value = producto.nombre;
                document.getElementById("precioProducto").value = producto.precio;
                document.getElementById("categoriaProducto").value = producto.categoria;
                document.getElementById("imagenProducto").value = producto.imagen || "";
                document.getElementById("descripcionProducto").value = producto.descripcion || "";

                document.getElementById("disponibilidadProducto").value =
                    String(producto.disponible !== false);

                document.getElementById("tituloFormularioProducto").textContent =
                    "Editar producto";

                document.getElementById("btnGuardarProducto").textContent =
                    "Actualizar producto";

                const cancelar = document.getElementById("btnCancelarEdicion");

                if (cancelar) cancelar.hidden = false;

                formularioProducto?.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

                return;
            }

            if (botonEstado) {

                if (producto.disponible === false) {
                    mostrarMensaje("Primero habilita este producto.");
                    return;
                }

                producto.agotado = !producto.agotado;

                guardarCarta();
                renderizarProductos();

                return;
            }

            if (botonDeshabilitar) {

                if (producto.disponible === false) {

                    producto.disponible = true;
                    producto.agotado = false;

                } else {

                    producto.disponible = false;
                    producto.agotado = false;
                }

                guardarCarta();
                renderizarProductos();

                return;
            }

            if (botonEliminar) {

                if (!confirm(`¿Eliminar "${producto.nombre}" de la carta?`)) {
                    return;
                }

                productos = productos.filter(p =>
                    String(p.id) !== String(producto.id)
                );

                guardarCarta();
                renderizarProductos();
            }
        });
    }

    document.getElementById("btnCancelarEdicion")?.addEventListener("click", () => {
        limpiarFormularioProducto();
    });

    /* =====================================================
       8. CATEGORÍAS
    ===================================================== */

    if (formularioCategoria) {

        formularioCategoria.addEventListener("submit", event => {

            event.preventDefault();

            const input = document.getElementById("nombreCategoria");
            const nombre = input?.value.trim();

            if (!nombre) {
                mostrarMensaje("Escribe el nombre de la categoría.");
                return;
            }

            if (categorias.some(c =>
                c.toLowerCase() === nombre.toLowerCase()
            )) {
                mostrarMensaje("Esta categoría ya existe.");
                return;
            }

            categorias.push(nombre);

            renderizarCategorias();

            if (input) input.value = "";

            mostrarMensaje("Categoría agregada correctamente.");
        });
    }

    document.getElementById("listaCategorias")?.addEventListener("click", event => {

        const boton = event.target.closest(".btn_eliminar_categoria");

        if (!boton) return;

        const categoria = boton.dataset.categoria;

        const tieneProductos = productos.some(p =>
            p.categoria === categoria
        );

        if (tieneProductos) {
            mostrarMensaje("No puedes eliminar una categoría que tiene productos.");
            return;
        }

        if (!confirm(`¿Eliminar la categoría "${categoria}"?`)) return;

        categorias = categorias.filter(c => c !== categoria);

        renderizarCategorias();
    });

    /* =====================================================
       9. FILTROS DE PRODUCTOS
    ===================================================== */

    document.querySelectorAll(".filtro_carta").forEach(boton => {

        boton.addEventListener("click", () => {

            document.querySelectorAll(".filtro_carta").forEach(b => {
                b.classList.remove("activo");
            });

            boton.classList.add("activo");

            /*
               CORRECCIÓN:
               El HTML utiliza data-filtro-producto.
            */

            filtroCartaActual =
                boton.dataset.filtroProducto || "todos";

            renderizarProductos();
        });
    });

    document.getElementById("buscarProducto")?.addEventListener("input", () => {
        renderizarProductos();
    });

    /* =====================================================
       10. RELOJ Y ASISTENCIA
    ===================================================== */

    function actualizarReloj() {

        const reloj = document.getElementById("relojActual");
        const fecha = document.getElementById("fechaActual");

        if (reloj) reloj.textContent = horaActual();
        if (fecha) fecha.textContent = fechaActual();
    }

    actualizarReloj();

    setInterval(actualizarReloj, 1000);

    function renderizarAsistencia() {

        const historial = document.getElementById("historialAsistencia");

        if (!historial) return;

        asistencia = obtenerDatos(CLAVE_ASISTENCIA, []);

        if (!Array.isArray(asistencia)) asistencia = [];

        historial.innerHTML = asistencia.slice().reverse().map(registro => `
            <div class="registro_asistencia">

                <strong>${escaparHTML(registro.fecha)}</strong>

                <p>
                    Entrada:
                    ${escaparHTML(registro.entrada || "No registrada")}
                </p>

                <p>
                    Salida:
                    ${escaparHTML(registro.salida || "Pendiente")}
                </p>

            </div>
        `).join("") || `
            <div class="mensaje_vacio">
                Todavía no hay registros de asistencia.
            </div>
        `;

        const estado = document.getElementById("estadoAsistencia");

        const registroHoy = asistencia.find(r =>
            r.fecha === fechaActual()
        );

        if (estado) {

            estado.textContent = registroHoy
                ? registroHoy.salida
                    ? "Jornada finalizada"
                    : "Entrada registrada"
                : "Sin registrar";
        }
    }

    document.getElementById("btnRegistrarEntrada")?.addEventListener("click", () => {

        asistencia = obtenerDatos(CLAVE_ASISTENCIA, []);

        const registroHoy = asistencia.find(r =>
            r.fecha === fechaActual()
        );

        if (registroHoy?.entrada) {
            mostrarMensaje("Ya registraste tu entrada de hoy.");
            return;
        }

        asistencia.push({
            fecha: fechaActual(),
            entrada: horaActual(),
            salida: ""
        });

        guardarDatos(CLAVE_ASISTENCIA, asistencia);

        renderizarAsistencia();

        mostrarMensaje("Entrada registrada correctamente.");
    });

    document.getElementById("btnRegistrarSalida")?.addEventListener("click", () => {

        asistencia = obtenerDatos(CLAVE_ASISTENCIA, []);

        const registroHoy = asistencia.find(r =>
            r.fecha === fechaActual()
        );

        if (!registroHoy?.entrada) {
            mostrarMensaje("Primero debes registrar tu entrada.");
            return;
        }

        if (registroHoy.salida) {
            mostrarMensaje("Ya registraste tu salida de hoy.");
            return;
        }

        registroHoy.salida = horaActual();

        guardarDatos(CLAVE_ASISTENCIA, asistencia);

        renderizarAsistencia();

        mostrarMensaje("Salida registrada correctamente.");
    });

    /* =====================================================
       11. CUENTA DEL MESERO
    ===================================================== */

    let cuenta = obtenerDatos(CLAVE_CUENTA, {
        nombre: "Mesero",
        telefono: "",
        correo: "",
        fecha: "",
        foto: ""
    });

    function cargarCuenta() {

        cuenta = obtenerDatos(CLAVE_CUENTA, cuenta);

        const nombrePerfil = document.getElementById("nombrePerfil");
        const correoPerfil = document.getElementById("correoPerfil");
        const fotoPerfil = document.getElementById("fotoPerfil");

        const nombre = document.getElementById("cuentaNombre");
        const telefono = document.getElementById("cuentaTelefono");
        const correo = document.getElementById("cuentaCorreo");
        const fecha = document.getElementById("cuentaFecha");

        if (nombrePerfil) {
            nombrePerfil.textContent = cuenta.nombre || "Mesero";
        }

        if (correoPerfil) {
            correoPerfil.textContent = cuenta.correo || "Sin correo";
        }

        if (nombre) nombre.value = cuenta.nombre || "";
        if (telefono) telefono.value = cuenta.telefono || "";
        if (correo) correo.value = cuenta.correo || "";
        if (fecha) fecha.value = cuenta.fecha || "";

        if (fotoPerfil && cuenta.foto) {
            fotoPerfil.src = cuenta.foto;
        }
    }

    cargarCuenta();

    const formularioCuenta = document.getElementById("formularioCuenta");

    formularioCuenta?.addEventListener("submit", event => {

        event.preventDefault();

        cuenta.nombre = document.getElementById("cuentaNombre").value.trim();
        cuenta.telefono = document.getElementById("cuentaTelefono").value.trim();
        cuenta.correo = document.getElementById("cuentaCorreo").value.trim();
        cuenta.fecha = document.getElementById("cuentaFecha").value;

        if (!cuenta.nombre || !cuenta.correo) {
            mostrarMensaje("Completa el nombre y el correo.");
            return;
        }

        guardarDatos(CLAVE_CUENTA, cuenta);

        cargarCuenta();

        mostrarMensaje("Datos de la cuenta actualizados.");
    });

    document.getElementById("btnEditarCuenta")?.addEventListener("click", () => {

        formularioCuenta?.querySelectorAll("input").forEach(input => {
            input.disabled = false;
        });

        const acciones = document.getElementById("accionesCuenta");

        if (acciones) acciones.hidden = false;
    });

    document.getElementById("btnCancelarCuenta")?.addEventListener("click", () => {

        cargarCuenta();

        formularioCuenta?.querySelectorAll("input").forEach(input => {
            input.disabled = true;
        });

        const acciones = document.getElementById("accionesCuenta");

        if (acciones) acciones.hidden = true;
    });

    /* =====================================================
       12. FOTO DE PERFIL
    ===================================================== */

    document.getElementById("cambiarFoto")?.addEventListener("change", event => {

        const archivo = event.target.files[0];

        if (!archivo) return;

        if (!archivo.type.startsWith("image/")) {
            mostrarMensaje("Selecciona una imagen válida.");
            event.target.value = "";
            return;
        }

        if (archivo.size > 2 * 1024 * 1024) {
            mostrarMensaje("La imagen no debe superar los 2 MB.");
            event.target.value = "";
            return;
        }

        const lector = new FileReader();

        lector.onload = () => {

            cuenta.foto = lector.result;

            if (guardarDatos(CLAVE_CUENTA, cuenta)) {
                cargarCuenta();
                mostrarMensaje("Foto de perfil actualizada.");
            }
        };

        lector.readAsDataURL(archivo);
    });

    /* =====================================================
       13. CAMBIAR CONTRASEÑA
    ===================================================== */

    document.getElementById("btnMostrarPassword")?.addEventListener("click", () => {

        const formulario = document.getElementById("formularioPassword");

        if (formulario) {
            formulario.hidden = !formulario.hidden;
        }
    });

    document.getElementById("formularioPassword")?.addEventListener("submit", event => {

        event.preventDefault();

        const actual = document.getElementById("passwordActual").value;
        const nueva = document.getElementById("passwordNueva").value;
        const confirmar = document.getElementById("passwordConfirmar").value;

        if (!actual || !nueva || !confirmar) {
            mostrarMensaje("Completa todos los campos.");
            return;
        }

        if (nueva.length < 6) {
            mostrarMensaje("La contraseña nueva debe tener al menos 6 caracteres.");
            return;
        }

        if (nueva !== confirmar) {
            mostrarMensaje("Las contraseñas nuevas no coinciden.");
            return;
        }

        mostrarMensaje(
            "La validación visual está lista, pero el cambio real de contraseña requiere autenticación en el servidor."
        );

        event.target.reset();
    });

    /* =====================================================
       14. NOTIFICACIONES
    ===================================================== */

    ["notificarPedidos", "notificarAsistencia"].forEach(id => {

        const elemento = document.getElementById(id);

        if (!elemento) return;

        const clave = "preferencia_" + id;

        elemento.checked = localStorage.getItem(clave) !== "false";

        elemento.addEventListener("change", () => {
            localStorage.setItem(clave, elemento.checked);
        });
    });

    /* =====================================================
       15. CERRAR SESIÓN
    ===================================================== */

    function cerrarSesion() {

        if (!confirm("¿Deseas cerrar sesión?")) return;

        mostrarMensaje("Sesión finalizada.");

        // Cuando tengas tu página de inicio de sesión,
        // puedes activar la siguiente línea:
        // window.location.href = "login.html";
    }

    document.getElementById("btnCerrarCuenta")?.addEventListener("click", cerrarSesion);

    document.querySelector(".btn_cerrar")?.addEventListener("click", cerrarSesion);

    /* =====================================================
       16. PAGOS
    ===================================================== */

    function renderizarPagos() {

        pedidos = obtenerDatos(CLAVE_PEDIDOS, []);
        pagos = obtenerDatos(CLAVE_PAGOS, []);

        if (!Array.isArray(pedidos)) pedidos = [];
        if (!Array.isArray(pagos)) pagos = [];

        const historial = document.getElementById("historialPagos");

        const pendientes = pedidos.filter(p =>
            obtenerEstadoPedido(p) !== "Entregado"
        );

        const totalRecaudado = pagos.reduce((suma, pago) => {
            return suma + Number(pago.monto || 0);
        }, 0);

        const cuentasPendientes = document.getElementById("cuentasPendientes");
        const pagosRegistrados = document.getElementById("pagosRegistrados");
        const totalElemento = document.getElementById("totalRecaudado");

        if (cuentasPendientes) {
            cuentasPendientes.textContent = pendientes.length;
        }

        if (pagosRegistrados) {
            pagosRegistrados.textContent = pagos.length;
        }

        if (totalElemento) {
            totalElemento.textContent = formatoMoneda(totalRecaudado);
        }

        if (!historial) return;

        historial.innerHTML = pagos.slice().reverse().map(pago => `
            <div class="registro_pago">

                <strong>Pago #${escaparHTML(pago.id)}</strong>

                <p>Mesa: ${escaparHTML(pago.mesa)}</p>

                <p>Método: ${escaparHTML(pago.metodo)}</p>

                <p>Monto: ${formatoMoneda(pago.monto)}</p>

                <p>Fecha: ${escaparHTML(pago.fecha)}</p>

                <p>Hora: ${escaparHTML(pago.hora || "")}</p>

            </div>
        `).join("") || `
            <div class="mensaje_vacio">
                Todavía no hay pagos registrados.
            </div>
        `;
    }

    document.getElementById("formularioPago")?.addEventListener("submit", event => {

        event.preventDefault();

        const mesa = document.getElementById("seleccionarMesaPago")?.value;
        const metodo = document.getElementById("metodoPago")?.value;
        const monto = Number(document.getElementById("montoPago")?.value);

        if (!mesa || !metodo || !Number.isFinite(monto) || monto <= 0) {
            mostrarMensaje("Completa correctamente los datos del pago.");
            return;
        }

        const pago = {
            id: crearId(),
            mesa,
            metodo,
            monto,
            fecha: fechaActual(),
            hora: horaActual()
        };

        pagos = obtenerDatos(CLAVE_PAGOS, []);

        pagos.push(pago);

        if (!guardarDatos(CLAVE_PAGOS, pagos)) return;

        renderizarPagos();

        event.target.reset();

        mostrarMensaje("Pago registrado correctamente.");
    });

    /* =====================================================
       17. ACTUALIZACIÓN ENTRE PESTAÑAS
       DEL MISMO NAVEGADOR
    ===================================================== */

    window.addEventListener("storage", event => {

        if (event.key === CLAVE_PEDIDOS) {

            pedidos = obtenerDatos(CLAVE_PEDIDOS, []);

            renderizarPedidos();
            renderizarMesas();
            renderizarPagos();
        }

        if (event.key === CLAVE_CARTA) {

            productos = obtenerDatos(CLAVE_CARTA, []);

            renderizarProductos();
        }

        if (event.key === CLAVE_CATEGORIAS) {

            categorias = obtenerDatos(CLAVE_CATEGORIAS, []);

            renderizarCategorias();
        }

        if (event.key === CLAVE_MESAS) {

            mesas = obtenerDatos(CLAVE_MESAS, mesasIniciales);

            renderizarMesas();
        }

        if (event.key === CLAVE_RESERVAS) {

            reservas = obtenerDatos(CLAVE_RESERVAS, []);

            renderizarReservas();
            renderizarMesas();
        }

        if (event.key === CLAVE_PAGOS) {

            pagos = obtenerDatos(CLAVE_PAGOS, []);

            renderizarPagos();
        }

        if (event.key === CLAVE_ASISTENCIA) {

            asistencia = obtenerDatos(CLAVE_ASISTENCIA, []);

            renderizarAsistencia();
        }

        if (event.key === CLAVE_CUENTA) {
            cargarCuenta();
        }
    });

    /* =====================================================
       18. ESTADO DE SINCRONIZACIÓN
    ===================================================== */

    const estadoSincronizacion = document.getElementById("estadoSincronizacion");

    if (estadoSincronizacion) {
        estadoSincronizacion.textContent =
            "Modo local: los datos se guardan en este navegador.";
    }

    /* =====================================================
       19. INICIALIZAR PANEL
    ===================================================== */

    renderizarPedidos();
    renderizarMesas();
    renderizarReservas();
    renderizarCategorias();
    renderizarProductos();
    renderizarAsistencia();
    renderizarPagos();

});
