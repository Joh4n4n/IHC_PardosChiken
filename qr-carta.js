
document.addEventListener("DOMContentLoaded", () => {

    const CLAVE_CARTA = "cartaRestaurante";

    let productos = [];
    let carrito = [];
    let categoriaActual = "Todos";
    let escaner = null;

    const parametros = new URLSearchParams(location.search);

    let localActual = parametros.get("local") || "";
    let mesaActual = parametros.get("mesa") || "";

    const formatoPrecio = n => "S/ " + Number(n).toFixed(2);

    const $ = id => document.getElementById(id);

    function actualizarMesa() {
        $("nombreLocalQR").textContent = localActual || "Sin identificar";
        $("numeroMesaQR").textContent = mesaActual || "Sin asignar";
    }

    function cargarCarta() {
        productos = JSON.parse(localStorage.getItem(CLAVE_CARTA) || "[]");
        mostrarCategorias();
        mostrarProductos();
    }

    function mostrarCategorias() {
        const categorias = [
            "Todos",
            ...new Set(productos.map(p => p.categoria).filter(Boolean))
        ];

        $("categoriasCarta").innerHTML = "";

        categorias.forEach(categoria => {
            const boton = document.createElement("button");
            boton.className = "categoria" +
                (categoria === categoriaActual ? " activa" : "");
            boton.textContent = categoria;

            boton.addEventListener("click", () => {
                categoriaActual = categoria;
                mostrarCategorias();
                mostrarProductos();
            });

            $("categoriasCarta").appendChild(boton);
        });
    }

    function mostrarProductos() {
        const contenedor = $("productosCarta");
        contenedor.innerHTML = "";

        const filtrados = productos.filter(p =>
            categoriaActual === "Todos" || p.categoria === categoriaActual
        );

        if (!filtrados.length) {
            contenedor.textContent = "No hay productos disponibles.";
            return;
        }

        filtrados.forEach(producto => {
            const tarjeta = document.createElement("div");
            tarjeta.className = "tarjeta_comida";

            const imagen = document.createElement("img");
            imagen.src = producto.imagen || "imagenes/Cliente.png";
            imagen.alt = producto.nombre;
            imagen.onerror = () => {
                imagen.onerror = null;
                imagen.src = "imagenes/Cliente.png";
            };

            const info = document.createElement("div");
            info.className = "info_comida";

            const titulo = document.createElement("h3");
            titulo.textContent = producto.nombre;

            const descripcion = document.createElement("p");
            descripcion.textContent = producto.descripcion || "";

            const pie = document.createElement("div");
            pie.className = "pie_comida";

            const precio = document.createElement("strong");
            precio.textContent = formatoPrecio(producto.precio);

            pie.appendChild(precio);

            if (producto.disponible) {
                const boton = document.createElement("button");
                boton.className = "btn_agregar";
                boton.textContent = "Agregar +";
                boton.addEventListener("click", () => agregar(producto.id));
                pie.appendChild(boton);
            } else {
                const agotado = document.createElement("span");
                agotado.textContent = "Agotado";
                agotado.className = "producto_agotado";
                pie.appendChild(agotado);
            }

            info.append(titulo, descripcion, pie);
            tarjeta.append(imagen, info);
            contenedor.appendChild(tarjeta);
        });
    }

    function agregar(id) {
        const producto = productos.find(p => p.id === id);

        if (!producto || !producto.disponible) return;

        const item = carrito.find(p => p.id === id);

        if (item) {
            item.cantidad++;
        } else {
            carrito.push({
                id: producto.id,
                nombre: producto.nombre,
                precio: Number(producto.precio),
                cantidad: 1
            });
        }

        mostrarCarrito();
    }

    function cambiarCantidad(id, cambio) {
        const item = carrito.find(p => p.id === id);
        if (!item) return;

        item.cantidad += cambio;

        if (item.cantidad <= 0) {
            carrito = carrito.filter(p => p.id !== id);
        }

        mostrarCarrito();
    }

    function mostrarCarrito() {
        const lista = $("listaCarrito");
        lista.innerHTML = "";

        let total = 0;
        let cantidad = 0;

        carrito.forEach(item => {
            total += item.precio * item.cantidad;
            cantidad += item.cantidad;

            const fila = document.createElement("div");
            fila.className = "item_carrito";

            const nombre = document.createElement("span");
            nombre.textContent = `${item.nombre} - ${formatoPrecio(item.precio * item.cantidad)}`;

            const controles = document.createElement("div");
            controles.className = "controles_carrito";

            const menos = document.createElement("button");
            menos.textContent = "-";
            menos.addEventListener("click", () => cambiarCantidad(item.id, -1));

            const numero = document.createElement("span");
            numero.textContent = item.cantidad;

            const mas = document.createElement("button");
            mas.textContent = "+";
            mas.addEventListener("click", () => cambiarCantidad(item.id, 1));

            controles.append(menos, numero, mas);
            fila.append(nombre, controles);
            lista.appendChild(fila);
        });

        $("cantidadCarrito").textContent = cantidad;
        $("totalCarrito").textContent = formatoPrecio(total);
        $("totalFinal").textContent = formatoPrecio(total);
    }

    $("btnVerCarrito").addEventListener("click", () => {
        $("panelCarrito").hidden = false;
    });

    $("btnCerrarCarrito").addEventListener("click", () => {
        $("panelCarrito").hidden = true;
    });

    $("btnConfirmarPedido").addEventListener("click", () => {
        if (!localActual || !mesaActual) {
            alert("Primero identifica tu mesa escaneando el QR.");
            return;
        }

        if (!carrito.length) {
            alert("Tu carrito está vacío.");
            return;
        }

        const pedidos = JSON.parse(
            localStorage.getItem("pedidosCliente") || "[]"
        );

        const pedido = {
            id: Date.now(),
            local: localActual,
            mesa: mesaActual,
            productos: carrito.map(p => ({...p})),
            total: carrito.reduce(
                (s, p) => s + p.precio * p.cantidad, 0
            ),
            estado: "Pendiente",
            fecha: new Date().toISOString()
        };

        pedidos.push(pedido);
        localStorage.setItem("pedidosCliente", JSON.stringify(pedidos));

        alert("Pedido guardado en este navegador. Aún falta conectarlo con el Panel Mesero.");

        carrito = [];
        mostrarCarrito();
        $("panelCarrito").hidden = true;
    });

    // ESCÁNER QR

    $("btnAbrirEscaner").addEventListener("click", async () => {
        $("contenedorEscaner").hidden = false;

        if (typeof Html5Qrcode === "undefined") {
            $("mensajeEscaner").textContent = "No se cargó la biblioteca QR.";
            return;
        }

        if (escaner) return;

        escaner = new Html5Qrcode("lectorQR");

        try {
            await escaner.start(
                { facingMode: "environment" },
                { fps: 10, qrbox: { width: 230, height: 230 } },
                async texto => {
                    try {
                        const url = new URL(texto);

                        const local = url.searchParams.get("local");
                        const mesa = url.searchParams.get("mesa");

                        if (!local || !mesa) {
                            throw new Error("QR inválido");
                        }

                        localActual = local;
                        mesaActual = mesa;

                        const nuevaURL = new URL(location.href);
                        nuevaURL.searchParams.set("local", local);
                        nuevaURL.searchParams.set("mesa", mesa);

                        history.replaceState({}, "", nuevaURL);

                        actualizarMesa();
                        $("mensajeEscaner").textContent = "Mesa identificada correctamente.";

                        await detenerEscaner();

                    } catch (error) {
                        $("mensajeEscaner").textContent =
                            "Este QR no tiene el formato esperado.";
                    }
                }
            );
        } catch (error) {
            escaner = null;
            $("mensajeEscaner").textContent =
                "No se pudo abrir la cámara. Revisa los permisos.";
        }
    });

    async function detenerEscaner() {
        if (escaner) {
            try {
                await escaner.stop();
                await escaner.clear();
            } catch (error) {
                console.error(error);
            }
            escaner = null;
        }

        $("contenedorEscaner").hidden = true;
    }

    $("btnCerrarEscaner").addEventListener("click", detenerEscaner);

    actualizarMesa();
    cargarCarta();
    mostrarCarrito();

});
