/* Ficha de una propiedad: galería, características, mapa y WhatsApp */
(function () {
  "use strict";
  const { icono, m2, precioHTML, precioPlano, areaTerrenoTexto, TIPOS, foto, esc, ubicacion, whatsappURL, tarjeta, iniciarComun } = window.AG;
  const TODAS = window.PROPIEDADES || [];
  const id = new URLSearchParams(location.search).get("id");
  const p = TODAS.find(x => x.id === id);
  const raiz = document.getElementById("ficha");

  iniciarComun();

  if (!p) {
    raiz.innerHTML = '<div class="no-encontrada"><h1>Propiedad no encontrada</h1><p>Es posible que ya se haya vendido o que el enlace no sea correcto.</p>' +
      '<p><a class="btn btn-navy" href="index.html#propiedades">' + icono("volver") + "Ver todas las propiedades</a></p></div>";
    document.getElementById("wa-cabecera").href = whatsappURL(null);
    document.getElementById("wa-flotante").href = whatsappURL(null);
    return;
  }

  document.title = p.titulo + " | Andagana Corporación";
  const wa = whatsappURL(p);
  const fotos = (p.fotos || []).map((_, i) => foto(p, i));
  const area = areaTerrenoTexto(p);
  const noAplica = p.tipo === "terreno" ? "No aplica" : "No especificado";

  // ---------- Características con iconos ----------
  const caract = [
    { ic: p.tipo, t: "Tipo", v: p.subtipo || TIPOS[p.tipo].nombre, ok: true },
    { ic: "garaje", t: "Garaje", v: p.garaje || noAplica, ok: !!p.garaje },
    { ic: "servicios", t: "Servicios básicos", v: p.serviciosBasicos ? "Disponibles" : "Consultar", ok: !!p.serviciosBasicos },
    { ic: "vias", t: "Vías de acceso", v: p.viasAcceso || "Consultar", ok: !!p.viasAcceso },
    { ic: "construccion", t: "Área de construcción", v: p.areaConstruccion ? m2(p.areaConstruccion) : noAplica, ok: !!p.areaConstruccion },
    { ic: "area", t: "Área de terreno", v: area || "Consultar", ok: !!area }
  ];

  const consultaMapa = p.mapa || ubicacion(p) + ", Ecuador";
  const mapaSrc = "https://maps.google.com/maps?q=" + encodeURIComponent(consultaMapa) + "&z=15&hl=es&output=embed";
  const mapaLink = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(consultaMapa);

  const relacionadas = TODAS
    .filter(x => x.id !== p.id)
    .map(x => ({ x, s: (x.canton === p.canton ? 2 : 0) + (x.tipo === p.tipo ? 1 : 0) + (x.sector === p.sector ? 1 : 0) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map(o => o.x);

  raiz.innerHTML =
    '<nav class="migas" aria-label="Ruta"><a href="index.html#propiedades">' + icono("volver") + "Propiedades</a><span>/</span><span>" + esc(p.canton) + "</span><span>/</span><span>" + esc(p.sector || "") + "</span></nav>" +
    '<div class="ficha-cabecera aparecer">' +
      "<div>" +
        '<div class="ficha-etiquetas"><span class="pill pill-plata">' + icono("rayo") + "¡Financiamiento inmediato!</span>" +
        '<span class="pill pill-navy">' + icono(p.tipo) + esc(TIPOS[p.tipo].nombre) + "</span></div>" +
        "<h1>" + esc(p.titulo) + "</h1>" +
        '<div class="ficha-ubicacion">' + icono("ubicacion") + esc(ubicacion(p)) + (p.provincia ? " · " + esc(p.provincia) : "") + "</div>" +
      "</div>" +
    "</div>" +
    '<div class="ficha-grid">' +
      "<div>" +
        // Galería
        '<div class="galeria aparecer">' +
          '<div class="galeria-principal" id="g-principal">' +
            '<div class="fondo-desenfoque" id="g-fondo"></div>' +
            '<img id="g-img" alt="' + esc(p.titulo) + '">' +
            (fotos.length > 1 ? '<button class="galeria-flecha prev" id="g-prev" aria-label="Foto anterior">' + icono("flechaIzq") + "</button>" +
              '<button class="galeria-flecha next" id="g-next" aria-label="Foto siguiente">' + icono("flechaDer") + "</button>" : "") +
            '<span class="galeria-contador" id="g-contador"></span>' +
            '<button class="galeria-ampliar" id="g-ampliar">' + icono("ampliar") + "Ampliar</button>" +
          "</div>" +
          '<div class="galeria-miniaturas" id="g-minis">' +
            fotos.map((f, i) => '<button type="button" data-i="' + i + '" aria-label="Ver foto ' + (i + 1) + '"><img src="' + esc(f) + '" alt="" loading="lazy"></button>').join("") +
          "</div>" +
        "</div>" +
        // Características
        '<section class="bloque"><h2>Características</h2><div class="caracteristicas">' +
          caract.map(c => '<div class="caract' + (c.ok ? "" : " inactiva") + '"><span class="caract-icono">' + icono(c.ic) + "</span><div><small>" + c.t + "</small><strong>" + esc(c.v) + "</strong></div></div>").join("") +
        "</div>" +
        ((p.caracteristicas || []).length ? '<div class="extras">' + p.caracteristicas.map(t => "<span>" + icono("check") + esc(t) + "</span>").join("") + "</div>" : "") +
        "</section>" +
        // Descripción
        '<section class="bloque"><h2>Descripción</h2><p>' + esc(p.descripcion) + "</p></section>" +
        // Mapa
        '<section class="bloque"><h2>Ubicación</h2>' +
          '<div class="mapa"><iframe src="' + esc(mapaSrc) + '" loading="lazy" referrerpolicy="no-referrer-when-downgrade" title="Mapa de ' + esc(ubicacion(p)) + '"></iframe></div>' +
          '<div class="mapa-nota"><span>Ubicación referencial del sector. Pide la dirección exacta por WhatsApp.</span><a href="' + esc(mapaLink) + '" target="_blank" rel="noopener">Abrir en Google Maps ↗</a></div>' +
        "</section>" +
      "</div>" +
      // Lateral de precio
      "<aside>" +
        '<div class="precio-caja aparecer">' +
          '<div class="etq">PRECIO ESPECIAL</div>' +
          '<div class="monto">' + precioHTML(p, true) + "</div>" +
          '<div class="codigo">' + (p.codigo ? "COD: " + esc(p.codigo) : "SIN CÓDIGO") + "</div>" +
          '<div class="resumen">' +
            "<div><small>Terreno</small><strong>" + esc(area || "—") + "</strong></div>" +
            "<div><small>Construcción</small><strong>" + (p.areaConstruccion ? m2(p.areaConstruccion) : "—") + "</strong></div>" +
          "</div>" +
          '<div class="fin">' + icono("dinero") + "<div>¡Financiamiento inmediato!<span>Te ayudamos con un plan a tu medida.</span></div></div>" +
          '<a class="btn btn-wa btn-bloque" href="' + esc(wa) + '" target="_blank" rel="noopener">' + icono("whatsapp") + "Me interesa, escribir por WhatsApp</a>" +
          '<div class="tel">o llámanos al <strong>' + esc((window.ANDAGANA || {}).whatsappVisible || "") + "</strong></div>" +
        "</div>" +
      "</aside>" +
    "</div>" +
    (relacionadas.length ? '<section class="relacionadas"><div class="seccion-titulo"><div><span class="eyebrow">También te puede interesar</span><h2>Propiedades similares</h2></div></div><div class="grilla">' + relacionadas.map(tarjeta).join("") + "</div></section>" : "");

  document.getElementById("wa-cabecera").href = wa;
  document.getElementById("wa-flotante").href = wa;
  document.body.classList.add("con-barra");
  document.getElementById("barra-movil").innerHTML =
    '<div class="bm-precio"><small>Precio especial · ' + (p.codigo ? "COD " + esc(p.codigo) : "Sin código") + "</small>" + esc(precioPlano(p)) + "</div>" +
    '<a class="btn btn-wa" href="' + esc(wa) + '" target="_blank" rel="noopener">' + icono("whatsapp") + "WhatsApp</a>";

  // ---------- Galería ----------
  let actual = 0;
  const gImg = document.getElementById("g-img");
  const gFondo = document.getElementById("g-fondo");
  const gContador = document.getElementById("g-contador");
  const minis = Array.from(document.querySelectorAll("#g-minis button"));
  const visor = document.getElementById("visor");
  const vImg = document.getElementById("visor-img");

  function mostrar(i) {
    actual = (i + fotos.length) % fotos.length;
    gImg.src = fotos[actual];
    gFondo.style.backgroundImage = 'url("' + fotos[actual] + '")';
    gContador.textContent = (actual + 1) + " / " + fotos.length;
    minis.forEach((b, j) => b.setAttribute("aria-current", j === actual));
    const m = minis[actual];
    if (m) m.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
    if (visor.classList.contains("abierto")) pintarVisor();
    // precarga la siguiente
    const sig = new Image(); sig.src = fotos[(actual + 1) % fotos.length];
  }
  function pintarVisor() {
    vImg.src = fotos[actual];
    document.getElementById("visor-contador").textContent = (actual + 1) + " / " + fotos.length;
  }
  function abrirVisor() { visor.classList.add("abierto"); pintarVisor(); document.body.style.overflow = "hidden"; }
  function cerrarVisor() { visor.classList.remove("abierto"); document.body.style.overflow = ""; }

  minis.forEach(b => b.addEventListener("click", () => mostrar(Number(b.dataset.i))));
  const prev = document.getElementById("g-prev"), next = document.getElementById("g-next");
  if (prev) prev.addEventListener("click", e => { e.stopPropagation(); mostrar(actual - 1); });
  if (next) next.addEventListener("click", e => { e.stopPropagation(); mostrar(actual + 1); });
  document.getElementById("g-principal").addEventListener("click", abrirVisor);

  const vc = document.getElementById("visor-cerrar"), vp = document.getElementById("visor-prev"), vn = document.getElementById("visor-next");
  vc.innerHTML = icono("cerrar"); vp.innerHTML = icono("flechaIzq"); vn.innerHTML = icono("flechaDer");
  vc.addEventListener("click", cerrarVisor);
  vp.addEventListener("click", () => mostrar(actual - 1));
  vn.addEventListener("click", () => mostrar(actual + 1));
  visor.addEventListener("click", e => { if (e.target === visor) cerrarVisor(); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape") cerrarVisor();
    if (e.key === "ArrowLeft") mostrar(actual - 1);
    if (e.key === "ArrowRight") mostrar(actual + 1);
  });

  // deslizar con el dedo
  function deslizar(el) {
    let x0 = null;
    el.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, { passive: true });
    el.addEventListener("touchend", e => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) mostrar(actual + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }
  deslizar(document.getElementById("g-principal"));
  deslizar(visor);

  mostrar(0);
})();
