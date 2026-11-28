/* Funciones compartidas por todas las páginas */
(function () {
  "use strict";

  // ---------- Iconos (SVG de línea) ----------
  const P = {
    casa: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    terreno: '<path d="M3 20h18"/><path d="M4 20 9 9l4 6 3-4 4 9"/><circle cx="17" cy="5" r="2"/>',
    departamento: '<rect x="4" y="3" width="10" height="18" rx="1"/><path d="M14 9h6v12h-6"/><path d="M7 7h1M10 7h1M7 11h1M10 11h1M7 15h1M10 15h1M17 13h0M17 17h0"/>',
    local: '<path d="M4 9h16l-1.5-5h-13z"/><path d="M4 9a2.7 2.7 0 0 0 5.3 0 2.7 2.7 0 0 0 5.4 0 2.7 2.7 0 0 0 5.3 0"/><path d="M5 11.5V20h14v-8.5"/><path d="M10 20v-5h4v5"/>',
    todos: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    garaje: '<path d="M3 21V9l9-5 9 5v12"/><path d="M7 21v-6h10v6"/><path d="M7 18h10"/>',
    servicios: '<path d="M12 3s-5 5.6-5 9.5a5 5 0 0 0 10 0C17 8.6 12 3 12 3z"/><path d="M12 17a3 3 0 0 1-3-3"/>',
    vias: '<path d="M8 3 4 21"/><path d="M16 3l4 18"/><path d="M12 4v2.5M12 10.5v3M12 17.5V20"/>',
    construccion: '<path d="M4 21V10l8-6 8 6v11"/><path d="M4 21h16"/><path d="M9 21v-7h6v7"/><path d="M2 10h3M19 10h3"/>',
    area: '<path d="M4 4h6M4 4v6M20 20h-6M20 20v-6M4 20l16-16"/><path d="M14 4h6v6M4 14v6h6"/>',
    ubicacion: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    buscar: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    filtro: '<path d="M4 5h16M7 12h10M10 19h4"/>',
    camara: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
    flechaIzq: '<path d="m15 5-7 7 7 7"/>',
    flechaDer: '<path d="m9 5 7 7-7 7"/>',
    volver: '<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>',
    cerrar: '<path d="M6 6l12 12M18 6 6 18"/>',
    ampliar: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7"/>',
    dinero: '<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.8"/><path d="M6 9.5v5M18 9.5v5"/>',
    escudo: '<path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6z"/><path d="m8.8 12 2.2 2.2 4.4-4.4"/>',
    apreton: '<path d="m11 17 2 2a1.4 1.4 0 0 0 2-2"/><path d="m14 14 2.5 2.5a1.4 1.4 0 0 0 2-2L15 11"/><path d="M3 8l4-4 5 5"/><path d="m21 8-4-4-4.5 4.5a2 2 0 0 0 2.8 2.8L17 9.5"/><path d="M3 8v6l6 6 2-2"/><path d="M21 8v6l-2 2"/>',
    rayo: '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    regalo: '<rect x="3.5" y="8" width="17" height="4" rx="1"/><path d="M5 12v9h14v-9"/><path d="M12 8v13"/><path d="M12 8S10.5 3.5 8 3.5a2.2 2.2 0 0 0 0 4.5h4zM12 8s1.5-4.5 4-4.5a2.2 2.2 0 0 1 0 4.5h-4z"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 9.5h8M8 12.5h5"/>',
    firma: '<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4"/><path d="M8.5 17c1.5-2 2.5-2 3 0s1.5 1 2.5-.5 1.5 0 2 .5"/>',
    usuario: '<circle cx="12" cy="8" r="4"/><path d="M4 21c.8-4 4-6 8-6s7.2 2 8 6"/>',
    llave: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M14 9l2 2"/>',
    telefono: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>',
    mapa: '<path d="m9 4-6 3v13l6-3 6 3 6-3V4l-6 3z"/><path d="M9 4v13M15 7v13"/>',
    monedas: '<ellipse cx="9" cy="6" rx="6" ry="2.5"/><path d="M3 6v4c0 1.4 2.7 2.5 6 2.5M3 10v4c0 1.4 2.7 2.5 6 2.5M3 14v4c0 1.4 2.7 2.5 6 2.5M15 6v2"/><circle cx="16.5" cy="15.5" r="5"/><path d="M18 13.6c-.4-.4-1-.6-1.6-.6-.9 0-1.6.5-1.6 1.2 0 1.6 3.3.8 3.3 2.5 0 .7-.7 1.2-1.7 1.2-.7 0-1.3-.3-1.7-.7M16.5 12.2v1M16.5 18v1"/>',
    banco: '<path d="M3 9.5 12 4l9 5.5"/><path d="M4 9.5h16"/><path d="M6 12v5M10 12v5M14 12v5M18 12v5"/><path d="M4 17.5h16M3 20.5h18"/>',
    manoDinero: '<circle cx="15" cy="7" r="4.2"/><path d="M15.9 5.4c-.3-.3-.7-.4-1.1-.4-.6 0-1.1.3-1.1.8 0 1.1 2.4.5 2.4 1.7 0 .5-.5.9-1.2.9-.5 0-.9-.2-1.2-.5M15 4v.9M15 9.1v.9"/><path d="M2 14h3l4.5-1.5c.9-.3 1.8.1 2.1.9.2.6-.1 1.2-.7 1.5L8.5 16"/><path d="M5 20l3.5-1.5h5.5c.8 0 1.5-.3 2-.8L21 13c.5-.6.4-1.4-.2-1.8-.5-.3-1.2-.3-1.7.1L15 14.5"/><path d="M2 14v6h3"/>',
    cama: '<path d="M3 18V7M3 13h18v5M21 18v-3a3 3 0 0 0-3-3h-7v1"/><circle cx="7" cy="10.5" r="1.8"/>',
    bano: '<path d="M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M6 12V6a2 2 0 0 1 3.5-1.3"/><path d="M8 19l-1 2M16 19l1 2"/>',
    citas: '<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/><path d="m9 15 2 2 4-4"/>'
  };
  const MARCAS = {
    facebook: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 21.9v-7.4h2.5l.4-2.9h-2.9V9.8c0-.8.2-1.4 1.4-1.4h1.6V5.8c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.1H7.8v2.9h2.6v7.3A10 10 0 1 1 13.5 21.9z"/></svg>',
    tiktok: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16.6 3h-3.1v12.4a2.7 2.7 0 1 1-2.7-2.7c.3 0 .5 0 .8.1V9.6a5.8 5.8 0 1 0 5 5.8V9.1a7.3 7.3 0 0 0 4.3 1.4V7.4c-2.3 0-4.3-1.9-4.3-4.4z"/></svg>'
  };
  const WA = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.9-4.45 9.9-9.91A9.84 9.84 0 0 0 12.04 2zm0 18.15h-.01a8.2 8.2 0 0 1-4.19-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.23 8.23 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24a8.2 8.2 0 0 1 8.24 8.25c0 4.54-3.7 8.23-8.24 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.13-.16.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23a7.46 7.46 0 0 1-1.38-1.72c-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.16.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.42h-.48a.92.92 0 0 0-.67.31c-.23.25-.87.85-.87 2.08s.89 2.42 1.02 2.58c.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.47-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.06-.1-.23-.17-.48-.29z"/></svg>';

  function icono(nombre) {
    if (nombre === "whatsapp") return WA;
    if (MARCAS[nombre]) return MARCAS[nombre];
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (P[nombre] || "") + "</svg>";
  }

  // ---------- Formatos ----------
  const fmtNum = new Intl.NumberFormat("es-EC", { maximumFractionDigits: 2 });
  function dinero(n) { return "$" + new Intl.NumberFormat("es-EC", { maximumFractionDigits: 0 }).format(n).replace(/,/g, "."); }
  function m2(n) { return fmtNum.format(n) + " m²"; }

  const sinPrecio = p => p.consultarPrecio || p.precio == null;
  function precioHTML(p, conDesde) {
    if (sinPrecio(p)) return "Consultar precio";
    return (conDesde && p.precioDesde ? "<small>Desde</small>" : "") + dinero(p.precio) +
      (p.operacion === "arriendo" ? "<small> /mes</small>" : "");
  }
  function precioPlano(p) {
    if (sinPrecio(p)) return "Consultar precio";
    return (p.precioDesde ? "Desde " : "") + dinero(p.precio) + (p.operacion === "arriendo" ? " al mes" : "");
  }
  const ESTADOS = { reservada: "Reservada", vendida: "Vendida" };
  function oficinaDe(p) {
    const ofs = (window.ANDAGANA || {}).oficinas || [];
    return ofs.find(o => o.id === (p && p.oficina)) || ofs[0] || null;
  }
  function areaTerrenoTexto(p) {
    if (p.areaTerrenoTexto) return p.areaTerrenoTexto;
    if (p.areaTerreno == null) return null;
    return (p.precioDesde ? "Desde " : "") + m2(p.areaTerreno);
  }

  const TIPOS = {
    casa: { nombre: "Casa", plural: "Casas" },
    terreno: { nombre: "Terreno", plural: "Terrenos" },
    departamento: { nombre: "Departamento", plural: "Departamentos" },
    local: { nombre: "Local", plural: "Locales" },
    "casa-rentera": { nombre: "Casa rentera", plural: "Casas renteras", icono: "departamento" },
    otro: { nombre: "Otro", plural: "Otros", icono: "todos" }
  };
  const iconoTipo = t => (TIPOS[t] && TIPOS[t].icono) || t;
  const nombreTipo = t => (TIPOS[t] || TIPOS.otro).nombre;

  function foto(p, i) {
    const f = (p.fotos || [])[i || 0];
    if (!f) return "img/logo.png";
    if (/^(https?:)?\/\//.test(f) || f.indexOf("/") !== -1) return f;
    return "img/propiedades/" + p.carpeta + "/" + f;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  function ubicacion(p) {
    return p.sector && p.sector !== p.canton ? p.sector + ", " + p.canton : p.canton;
  }

  // ---------- WhatsApp ----------
  function whatsappURL(p, mensaje) {
    const cfg = window.ANDAGANA || {};
    let msg = mensaje;
    if (msg) {
      // mensaje personalizado (por ejemplo, "Agenda tu cita")
    } else if (p) {
      const cod = p.codigo ? "con código *" + p.codigo + "*" : "(sin código)";
      msg = p.estado === "vendida"
        ? "Hola Andagana Corporación, vi la propiedad " + cod + ": " + p.titulo + " (" + ubicacion(p) + "), que ya está vendida. ¿Tienen algo similar?"
        : "Hola Andagana Corporación, me interesa la propiedad " + cod + ": " + p.titulo +
          " (" + ubicacion(p) + "), " + precioPlano(p) + ". ¿Me pueden dar más información sobre el financiamiento?";
    } else {
      msg = "Hola Andagana Corporación, me gustaría recibir información sobre sus propiedades y el financiamiento inmediato.";
    }
    // cada propiedad escribe al WhatsApp de su oficina; el resto, al número principal
    const of = p ? oficinaDe(p) : null;
    const numero = (of && of.whatsapp) || cfg.whatsapp || "593992674556";
    return "https://wa.me/" + numero + "?text=" + encodeURIComponent(msg);
  }

  // ---------- Oficinas ----------
  function oficinaWA(o) {
    const msg = "Hola Andagana Corporación (" + o.nombre + "), me gustaría recibir información sobre sus propiedades y el financiamiento.";
    return "https://wa.me/" + o.whatsapp + "?text=" + encodeURIComponent(msg);
  }
  function oficinaRuta(o) {
    return "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent(o.mapa || o.direccion);
  }
  function oficinaMapa(o) {
    return "https://maps.google.com/maps?q=" + encodeURIComponent(o.mapa || o.direccion) + "&z=16&hl=es&output=embed";
  }
  function tarjetaOficina(o) {
    return '<article class="oficina aparecer" data-oficina="' + esc(o.nombre) + '">' +
      '<div class="oficina-mapa"><iframe src="' + esc(oficinaMapa(o)) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Mapa de ' + esc(o.nombre) + '"></iframe></div>' +
      '<div class="oficina-cuerpo">' +
        '<div class="oficina-cabecera"><span class="oficina-icono">' + icono("ubicacion") + "</span>" +
          '<div><span class="oficina-tipo">' + esc(o.tipo) + "</span><h3>" + esc(o.nombre) + "</h3></div></div>" +
        '<p class="oficina-dato">' + icono("mapa") + "<span>" + esc(o.direccion) + "</span></p>" +
        '<p class="oficina-dato">' + icono("telefono") + "<span>Teléfono / WhatsApp: <strong>" + esc(o.telefonoVisible || o.telefono) + "</strong></span></p>" +
        '<div class="oficina-botones">' +
          '<a class="btn btn-wa" href="' + esc(oficinaWA(o)) + '" target="_blank" rel="noopener">' + icono("whatsapp") + "WhatsApp</a>" +
          '<a class="btn btn-navy" href="' + esc(oficinaRuta(o)) + '" target="_blank" rel="noopener" data-como-llegar>' + icono("mapa") + "Cómo llegar</a>" +
        "</div>" +
      "</div>" +
    "</article>";
  }
  function oficinaPie(o) {
    return '<div class="pie-oficina" data-oficina="' + esc(o.nombre) + '">' +
      "<strong>" + esc(o.nombre) + "</strong>" +
      '<a class="pie-dato" href="' + esc(oficinaRuta(o)) + '" target="_blank" rel="noopener" data-como-llegar>' + icono("ubicacion") + "<span>" + esc(o.direccion) + "</span></a>" +
      '<a class="pie-dato" href="' + esc(oficinaWA(o)) + '" target="_blank" rel="noopener">' + icono("whatsapp") + "<span>" + esc(o.telefonoVisible || o.telefono) + "</span></a>" +
    "</div>";
  }

  // ---------- Tarjeta de propiedad ----------
  function tarjeta(p) {
    const area = areaTerrenoTexto(p);
    const estado = ESTADOS[p.estado];
    return '<a class="tarjeta aparecer' + (estado ? " estado-" + p.estado : "") + (p.destacada ? " destacada" : "") + '" href="propiedad.html?id=' + encodeURIComponent(p.id) + '">' +
      '<div class="tarjeta-foto">' +
        '<img src="' + esc(foto(p, 0)) + '" alt="' + esc(p.titulo) + '" loading="lazy">' +
        (estado ? '<span class="franja-estado estado-' + p.estado + '">' + estado + "</span>" : "") +
        (p.financiamiento !== false && !estado ? '<span class="etiqueta-fin">' + icono("rayo") + "Financiamiento inmediato</span>" : "") +
        (p.destacada ? '<span class="etiqueta-destacada">★ Destacada</span>' : "") +
        '<span class="etiqueta-tipo">' + esc(p.subtipo || nombreTipo(p.tipo)) + (p.operacion === "arriendo" ? " · Arriendo" : "") + "</span>" +
        '<span class="tarjeta-fotos-num">' + icono("camara") + (p.fotos || []).length + "</span>" +
      "</div>" +
      '<div class="tarjeta-cuerpo">' +
        '<div class="tarjeta-ubicacion">' + icono("ubicacion") + esc(ubicacion(p)) + "</div>" +
        "<h3>" + esc(p.titulo) + "</h3>" +
        (p.precioEspecial !== false && !sinPrecio(p) && !estado ? '<div class="tarjeta-precio-etq">Precio especial</div>' : "") +
        '<div class="tarjeta-precio">' + precioHTML(p, true) + "</div>" +
        '<div class="tarjeta-datos">' +
          (area ? "<span title=\"Área de terreno\">" + icono("area") + esc(area) + "</span>" : "") +
          (p.areaConstruccion ? "<span title=\"Área de construcción\">" + icono("construccion") + m2(p.areaConstruccion) + "</span>" : "") +
          '<span class="tarjeta-codigo">' + (p.codigo ? "COD: " + esc(p.codigo) : "SIN CÓDIGO") + "</span>" +
        "</div>" +
      "</div>" +
    "</a>";
  }

  function iniciarComun() {
    const cfg = window.ANDAGANA || {};
    const oficinas = cfg.oficinas || [];
    document.querySelectorAll("[data-oficinas-tarjetas]").forEach(el => { el.innerHTML = oficinas.map(tarjetaOficina).join(""); });
    document.querySelectorAll("[data-oficinas-pie]").forEach(el => { el.innerHTML = oficinas.map(oficinaPie).join(""); });
    document.querySelectorAll("[data-wa-general]").forEach(a => { a.href = whatsappURL(null, a.dataset.waMsg); });
    document.querySelectorAll("[data-icono]").forEach(el => { el.insertAdjacentHTML("afterbegin", icono(el.dataset.icono)); });
    document.querySelectorAll("[data-tel]").forEach(el => { el.textContent = cfg.whatsappVisible || ""; });
    document.querySelectorAll("[data-direccion]").forEach(el => { el.textContent = cfg.direccion || ""; });
    document.querySelectorAll("[data-mapa-direccion]").forEach(a => {
      a.href = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent((cfg.direccion || "") + ", Ecuador");
    });
    document.querySelectorAll("[data-red]").forEach(a => {
      const url = cfg[a.dataset.red];
      if (url) a.href = url; else a.hidden = true;
    });
    document.querySelectorAll("[data-anio]").forEach(el => { el.textContent = new Date().getFullYear(); });
  }

  window.AG = { icono, dinero, m2, precioHTML, precioPlano, sinPrecio, areaTerrenoTexto, TIPOS, iconoTipo, nombreTipo, ESTADOS, oficinaDe, foto, esc, ubicacion, whatsappURL, tarjeta, iniciarComun };
})();
