/* Página "Recomienda y gana": formulario de referidos con envío por WhatsApp en dos pasos.
   Paso 1 -> WhatsApp principal (593992674556)
   Paso 2 -> copia al asesor de referidos (593982011648)
   No se guarda nada en un servidor: los datos solo viajan en el mensaje de WhatsApp.
   El estado del envío se recuerda en esta pestaña (sessionStorage) para que, al volver
   de WhatsApp, la página muestre el paso 2 aunque el navegador la haya recargado. */
(function () {
  "use strict";
  const { iniciarComun, icono, esc } = window.AG;
  iniciarComun();

  const cfg = window.ANDAGANA || {};
  const NUMERO_PASO1 = cfg.whatsapp || "593992674556";
  const NUMERO_PASO2 = cfg.whatsappReferidos || "593982011648";
  const CLAVE = "andagana_recomendacion";

  const form = document.getElementById("form-recomendar");
  const estado = document.getElementById("estado-envio");
  const errorGeneral = document.getElementById("error-general");

  // ---------- Utilidades ----------
  const valor = (n) => {
    const el = form.elements[n];
    if (!el) return "";
    if (el instanceof RadioNodeList) return el.value || "";
    if (el.type === "checkbox") return el.checked;
    return (el.value || "").trim().replace(/\s+/g, " ");
  };
  const soloDigitos = (s) => String(s || "").replace(/\D/g, "");
  // acepta "099 267 4556", "099-267-4556", "+593 99 267 4556" y lo deja como 0992674556
  function normalizarCelular(s) {
    let d = soloDigitos(s);
    if (d.startsWith("593") && d.length === 12) d = "0" + d.slice(3);
    return d;
  }
  const celularValido = (s) => /^09\d{8}$/.test(normalizarCelular(s));
  const miles = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  function fechaHoy() {
    const d = new Date();
    const dos = (x) => String(x).padStart(2, "0");
    return dos(d.getDate()) + "/" + dos(d.getMonth() + 1) + "/" + d.getFullYear() + " " + dos(d.getHours()) + ":" + dos(d.getMinutes());
  }
  function evento(nombre, datos) {
    if (window.AG_ANALITICA) window.AG_ANALITICA.evento(nombre, datos);
  }

  // ---------- Ayudas mientras se escribe ----------
  form.querySelectorAll("[data-numero]").forEach((el) => {
    el.addEventListener("input", () => {
      if (el.hasAttribute("data-miles")) {
        const d = soloDigitos(el.value).replace(/^0+(?=\d)/, "");
        el.value = d ? miles(d) : "";
      } else {
        el.value = el.value.replace(/[^\d.,]/g, "");
      }
    });
  });
  form.querySelectorAll("[data-celular]").forEach((el) => {
    el.addEventListener("input", () => { el.value = el.value.replace(/[^\d\s+-]/g, ""); });
    el.addEventListener("blur", () => {
      const n = normalizarCelular(el.value);
      if (/^09\d{8}$/.test(n)) el.value = n.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3");
      if (el.closest(".rec-campo").classList.contains("con-error")) validarCampo(el);
    });
  });
  // al corregir un campo con error, el aviso desaparece
  form.addEventListener("input", (e) => {
    const campo = e.target.closest(".rec-campo, .rec-consentimiento");
    if (campo && campo.classList.contains("con-error")) {
      const el = e.target;
      if (el.type === "radio" || el.type === "checkbox") limpiarError(campo);
      else validarCampo(el);
    }
  });

  // ---------- Validación ----------
  function mostrarError(campo, texto) {
    campo.classList.add("con-error");
    let m = campo.querySelector(".rec-error");
    if (!m) {
      m = document.createElement("p");
      m.className = "rec-error";
      campo.appendChild(m);
    }
    m.textContent = texto;
    const input = campo.querySelector("input, textarea");
    if (input) input.setAttribute("aria-invalid", "true");
  }
  function limpiarError(campo) {
    campo.classList.remove("con-error");
    const m = campo.querySelector(".rec-error");
    if (m) m.remove();
    campo.querySelectorAll("[aria-invalid]").forEach((i) => i.removeAttribute("aria-invalid"));
  }
  function validarCampo(el) {
    const campo = el.closest(".rec-campo");
    const v = el.value.trim();
    if (el.required && !v) { mostrarError(campo, "Este dato es obligatorio."); return false; }
    if (el.hasAttribute("data-celular") && v && !celularValido(v)) {
      mostrarError(campo, "Escribe un celular de 10 dígitos que empiece con 09. Ej.: 0991234567");
      return false;
    }
    if (el.name === "refNombre" && v && v.split(/\s+/).length < 2) {
      mostrarError(campo, "Escribe tu nombre y apellido.");
      return false;
    }
    limpiarError(campo);
    return true;
  }
  function validar() {
    let primero = null;
    const marcar = (el) => { if (!primero) primero = el; };
    form.querySelectorAll("input[required], input[data-celular]").forEach((el) => { if (!validarCampo(el)) marcar(el); });
    form.querySelectorAll("[data-requerido]").forEach((campo) => {
      const n = campo.getAttribute("data-requerido");
      if (!valor(n)) {
        mostrarError(campo, n === "acepto" ? "Necesitamos tu autorización para enviar la recomendación." : "Elige una opción.");
        marcar(campo.querySelector("input"));
      } else limpiarError(campo);
    });
    if (!primero && normalizarCelular(valor("refCelular")) === normalizarCelular(valor("propCelular"))) {
      mostrarError(form.elements.propCelular.closest(".rec-campo"), "El celular del propietario no puede ser el mismo que el tuyo.");
      primero = form.elements.propCelular;
    }
    if (primero) {
      const n = form.querySelectorAll(".con-error").length;
      errorGeneral.textContent = n === 1 ? "Revisa el dato marcado en rojo." : "Revisa los " + n + " datos marcados en rojo.";
      errorGeneral.hidden = false;
      primero.closest(".rec-campo, .rec-consentimiento").scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => primero.focus({ preventScroll: true }), 350);
      return false;
    }
    errorGeneral.hidden = true;
    return true;
  }

  // ---------- Mensaje de WhatsApp ----------
  function armarMensaje() {
    const lineas = [];
    const dato = (etiqueta, v) => { if (v) lineas.push("• " + etiqueta + ": " + v); };
    const m2 = (v) => (v ? v.replace(/\s*m²?$/i, "") + " m²" : "");
    const precio = valor("precio") ? "$" + valor("precio") : "";

    lineas.push("🏡 *NUEVA RECOMENDACIÓN DE PROPIEDAD*");
    lineas.push("📅 Fecha: " + fechaHoy());
    lineas.push("");
    lineas.push("👤 *QUIEN RECOMIENDA*");
    dato("Nombre", valor("refNombre"));
    dato("Celular/WhatsApp", normalizarCelular(valor("refCelular")));
    dato("Ciudad", valor("refCiudad"));
    lineas.push("");
    lineas.push("🔑 *PROPIETARIO*");
    dato("Nombre", valor("propNombre"));
    dato("Celular", normalizarCelular(valor("propCelular")));
    dato("¿Sabe que nos pasan su contacto?", valor("propSabe"));
    lineas.push("");
    lineas.push("🏠 *LA PROPIEDAD*");
    dato("Tipo", valor("tipo"));
    dato("Operación", valor("operacion"));
    dato("Cantón", valor("canton"));
    dato("Sector / dirección", valor("sector"));
    dato("Área de terreno", m2(valor("areaTerreno")));
    dato("Área de construcción", m2(valor("areaConstruccion")));
    dato("Precio que pide el dueño", precio);
    dato("¿Tiene escrituras?", valor("escrituras"));
    if (valor("comentarios")) {
      lineas.push("");
      lineas.push("💬 *COMENTARIOS*");
      lineas.push(form.elements.comentarios.value.trim());
    }
    lineas.push("");
    lineas.push("✅ Acepto que Corporación Andagana use estos datos solo para contactar al propietario sobre la venta de su propiedad.");
    lineas.push("");
    lineas.push("📷 Si tengo fotos de la propiedad, las envío en este mismo chat.");
    return lineas.join("\n");
  }
  const urlWA = (numero, msg) => "https://wa.me/" + numero + "?text=" + encodeURIComponent(msg);
  function abrirWhatsApp(url) {
    const v = window.open(url, "_blank");
    if (v) { try { v.opener = null; } catch (e) { /* */ } }
    if (!v) window.location.href = url; // si el navegador bloquea la ventana nueva
  }

  // ---------- Estado del envío (paso 1 -> paso 2 -> gracias) ----------
  function guardar(s) { try { sessionStorage.setItem(CLAVE, JSON.stringify(s)); } catch (e) { /* modo privado */ } }
  function leer() { try { return JSON.parse(sessionStorage.getItem(CLAVE)); } catch (e) { return null; } }
  function borrar() { try { sessionStorage.removeItem(CLAVE); } catch (e) { /* */ } }
  let actual = null;

  const notaFotos = '<p class="rec-fotos">' + icono("camara") + "Si tienes fotos de la propiedad, envíalas en el mismo chat de WhatsApp.</p>";

  function pintar() {
    if (!actual) {
      estado.hidden = true;
      form.hidden = false;
      return;
    }
    form.hidden = true;
    estado.hidden = false;
    const resumen = '<p class="rec-resumen">' + esc(actual.tipo) + " en " + esc(actual.lugar) + "</p>";
    if (actual.paso === 2) {
      estado.innerHTML =
        '<div class="rec-estado-tarjeta">' +
          '<ol class="rec-progreso" aria-label="Progreso del envío">' +
            '<li class="hecho">' + icono("check") + "Paso 1</li>" +
            '<li class="actual"><span>2</span>Paso 2</li>' +
          "</ol>" +
          '<h3><span class="ok">✅</span> Paso 1 listo. Paso 2: envía una copia a nuestro asesor</h3>' +
          resumen +
          '<p>Abre WhatsApp otra vez y envía el mismo mensaje a nuestro asesor de referidos, para que tu recomendación quede registrada a tu nombre.</p>' +
          '<a class="btn btn-wa btn-bloque" id="btn-paso2" href="' + urlWA(NUMERO_PASO2, actual.mensaje) + '" target="_blank" rel="noopener">' +
            icono("whatsapp") + "Enviar copia al asesor</a>" +
          notaFotos +
          '<div class="rec-estado-pie">' +
            '<button type="button" class="enlace-sutil" id="btn-repetir1">¿No se abrió WhatsApp? Volver a abrir el paso 1</button>' +
            '<button type="button" class="enlace-sutil" id="btn-editar">Corregir los datos</button>' +
          "</div>" +
        "</div>";
      document.getElementById("btn-paso2").addEventListener("click", () => {
        evento("recomendacion_paso_2", { tipo_propiedad: actual.tipo, canton: actual.canton, paso: 2 });
        actual.paso = 3;
        guardar(actual);
        setTimeout(pintar, 400);
      });
      document.getElementById("btn-repetir1").addEventListener("click", () => abrirWhatsApp(urlWA(NUMERO_PASO1, actual.mensaje)));
      document.getElementById("btn-editar").addEventListener("click", () => {
        actual = null;
        borrar();
        pintar();
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } else {
      estado.innerHTML =
        '<div class="rec-estado-tarjeta gracias">' +
          '<span class="rec-gracias-icono">' + icono("regalo") + "</span>" +
          "<h3>¡Gracias por tu recomendación!</h3>" +
          resumen +
          "<p>Un asesor de Corporación Andagana revisará los datos, contactará al propietario y te escribirá para confirmar el monto de tu comisión. Recuerda: cobras hasta <strong>$500</strong> al firmarse la escritura de compraventa.</p>" +
          notaFotos +
          '<div class="rec-estado-botones">' +
            '<button type="button" class="btn btn-oro" id="btn-otra">' + icono("chat") + "Recomendar otra propiedad</button>" +
            '<a class="btn btn-borde-navy" href="index.html#propiedades">' + icono("casa") + "Ver propiedades</a>" +
          "</div>" +
          '<button type="button" class="enlace-sutil" id="btn-repetir2">¿No se abrió WhatsApp? Volver a enviar la copia al asesor</button>' +
        "</div>";
      document.getElementById("btn-otra").addEventListener("click", () => {
        actual = null;
        borrar();
        form.reset();
        pintar();
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      document.getElementById("btn-repetir2").addEventListener("click", () => abrirWhatsApp(urlWA(NUMERO_PASO2, actual.mensaje)));
    }
    estado.scrollIntoView({ behavior: "smooth", block: "start" });
    estado.focus({ preventScroll: true });
  }

  // ---------- Paso 1 ----------
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validar()) return;
    const mensaje = armarMensaje();
    const canton = valor("canton");
    actual = {
      paso: 2,
      mensaje: mensaje,
      tipo: valor("tipo"),
      canton: canton,
      lugar: valor("sector") && valor("sector") !== canton ? valor("sector") + ", " + canton : canton
    };
    evento("recomendacion_paso_1", {
      tipo_propiedad: actual.tipo,
      canton: canton,
      operacion: valor("operacion"),
      propietario_informado: valor("propSabe") === "Sí" ? "si" : "no",
      paso: 1
    });
    abrirWhatsApp(urlWA(NUMERO_PASO1, mensaje));
    guardar(actual);
    // se muestra al volver de WhatsApp (o enseguida, si WhatsApp se abrió en otra pestaña)
    setTimeout(pintar, 300);
  });

  // al volver a la página (recargada o desde el historial), continuar donde se quedó
  actual = leer();
  if (actual && actual.mensaje) pintar(); else actual = null;
  window.addEventListener("pageshow", (e) => {
    if (e.persisted) { actual = leer(); if (actual && actual.mensaje) pintar(); }
  });
})();
