/* ==========================================================
   Google Analytics 4 + aviso de cookies
   - Para cambiar de cuenta, reemplaza el ID de abajo.
   - Hasta que la persona acepte las cookies, GA4 funciona en
     "modo de consentimiento": no guarda cookies y solo envía
     datos anónimos y agregados.
   Eventos que se registran:
     clic_whatsapp   -> cada clic en un botón de WhatsApp
                        (codigo_propiedad cuando es dentro de una ficha)
     ver_propiedad   -> cada vez que se abre la ficha de una propiedad
     usar_filtro     -> cada cambio en los filtros del listado
     clic_como_llegar-> clic en "Cómo llegar" de una oficina
     recomendacion_paso_1 -> "Enviar recomendación" (WhatsApp principal)
     recomendacion_paso_2 -> "Enviar copia al asesor" (WhatsApp del asesor)
                        Solo se envía tipo, cantón y operación: nunca nombres ni celulares.
   ========================================================== */
(function () {
  "use strict";
  var GA_ID = "G-48472000GD";
  var CLAVE = "andagana_cookies"; // "aceptadas" | "rechazadas"

  function leerDecision() {
    try { return localStorage.getItem(CLAVE); } catch (e) { return null; }
  }
  function guardarDecision(v) {
    try { localStorage.setItem(CLAVE, v); } catch (e) { /* modo privado: no se guarda */ }
  }

  // ---------- gtag ----------
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  var decision = leerDecision();
  gtag("consent", "default", {
    analytics_storage: decision === "aceptadas" ? "granted" : "denied",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
    wait_for_update: 500
  });
  gtag("js", new Date());
  gtag("config", GA_ID);

  var s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
  document.head.appendChild(s);

  // ---------- Envío de eventos (lo usan las demás páginas) ----------
  function evento(nombre, parametros) {
    gtag("event", nombre, parametros || {});
  }

  // ---------- Clics en WhatsApp (todas las páginas) ----------
  var ORIGENES = [
    [".encabezado", "cabecera"],
    [".wa-flotante", "boton_flotante"],
    [".barra-movil", "barra_movil"],
    [".precio-caja", "ficha_precio"],
    [".rec-estado", "recomendar_copia_asesor"],
    [".recomendar", "pagina_recomendar"],
    [".banner", "portada"],
    ["#oficinas", "seccion_oficinas"],
    ["#financiamiento", "seccion_financiamiento"],
    ["#como-funciona", "seccion_como_funciona"],
    ["#contacto", "seccion_contacto"],
    [".pie", "pie_pagina"]
  ];
  function origen(el) {
    for (var i = 0; i < ORIGENES.length; i++) {
      if (el.closest(ORIGENES[i][0])) return ORIGENES[i][1];
    }
    return "otro";
  }
  document.addEventListener("click", function (e) {
    if (!e.target.closest) return;
    // "Cómo llegar" de una oficina
    var ruta = e.target.closest("[data-como-llegar]");
    if (ruta) {
      var of = ruta.closest("[data-oficina]");
      evento("clic_como_llegar", { oficina: of ? of.getAttribute("data-oficina") : "", ubicacion_boton: origen(ruta) });
      return;
    }
    var a = e.target.closest('a[href*="wa.me/"]');
    if (!a) return;
    var p = window.AG_PROPIEDAD; // la fija propiedad.js en la ficha
    var datos = {
      ubicacion_boton: origen(a),
      pagina: p ? "ficha" : (document.body.classList.contains("pagina-recomendar") ? "recomendar" : "inicio"),
      texto_boton: (a.textContent || "").trim().slice(0, 60) || "WhatsApp"
    };
    var oficina = a.closest("[data-oficina]");
    if (oficina) datos.oficina = oficina.getAttribute("data-oficina");
    if (p) {
      datos.codigo_propiedad = p.codigo || "SIN CODIGO";
      datos.propiedad_id = p.id;
    }
    evento("clic_whatsapp", datos);
  }, true);

  // ---------- Aviso de cookies ----------
  function decidir(valor) {
    guardarDecision(valor);
    gtag("consent", "update", { analytics_storage: valor === "aceptadas" ? "granted" : "denied" });
    var aviso = document.getElementById("aviso-cookies");
    if (aviso) aviso.classList.remove("visible");
  }
  function mostrarAviso() {
    var aviso = document.getElementById("aviso-cookies");
    if (!aviso) {
      aviso = document.createElement("div");
      aviso.id = "aviso-cookies";
      aviso.className = "aviso-cookies";
      aviso.setAttribute("role", "region");
      aviso.setAttribute("aria-label", "Aviso de cookies");
      aviso.innerHTML =
        '<p>Usamos cookies de <strong>Google Analytics</strong> para saber cómo se usa el sitio y mejorarlo. No las usamos para publicidad.</p>' +
        '<div class="aviso-botones">' +
          '<button type="button" class="btn btn-borde-navy" data-cookies-respuesta="rechazadas">Rechazar</button>' +
          '<button type="button" class="btn btn-navy" data-cookies-respuesta="aceptadas">Aceptar</button>' +
        "</div>";
      aviso.addEventListener("click", function (e) {
        var b = e.target.closest("[data-cookies-respuesta]");
        if (b) decidir(b.getAttribute("data-cookies-respuesta"));
      });
      document.body.appendChild(aviso);
    }
    requestAnimationFrame(function () { aviso.classList.add("visible"); });
  }
  document.addEventListener("DOMContentLoaded", function () {
    if (!decision) mostrarAviso();
    // enlace "Cookies" del pie de página para cambiar la decisión
    document.querySelectorAll("[data-cookies]").forEach(function (b) {
      b.addEventListener("click", mostrarAviso);
    });
  });

  window.AG_ANALITICA = { evento: evento, mostrarAviso: mostrarAviso };
})();
