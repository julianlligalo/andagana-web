/* Página de inicio: listado y filtros */
(function () {
  "use strict";
  const { icono, tarjeta, TIPOS, esc, iniciarComun } = window.AG;
  const TODAS = (window.PROPIEDADES || []).slice();
  const $ = id => document.getElementById(id);

  const estado = { tipo: "", buscar: "", canton: "", sector: "", pmin: "", pmax: "", amin: "", amax: "", orden: "" };

  const normal = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  const unicos = arr => Array.from(new Set(arr.filter(Boolean))).sort((a, b) => a.localeCompare(b, "es"));

  // ---------- Botones de tipo ----------
  function pintarTipos() {
    const base = filtrar(Object.assign({}, estado, { tipo: "" }));
    const opciones = [["", "Todos", "todos"]].concat(Object.keys(TIPOS).map(k => [k, TIPOS[k].plural, k]));
    $("filtro-tipos").innerHTML = opciones.map(([val, txt, ic]) => {
      const n = val ? base.filter(p => p.tipo === val).length : base.length;
      return '<button type="button" class="chip" data-tipo="' + val + '" aria-pressed="' + (estado.tipo === val) + '">' +
        icono(ic) + txt + ' <span class="cuenta">' + n + "</span></button>";
    }).join("");
  }
  $("filtro-tipos").addEventListener("click", e => {
    const b = e.target.closest("[data-tipo]");
    if (!b) return;
    estado.tipo = b.dataset.tipo;
    actualizar();
  });

  // ---------- Cantón / sector ----------
  function llenarSelect(sel, valores, actual) {
    sel.innerHTML = '<option value="">Todos</option>' + valores.map(v => '<option' + (v === actual ? " selected" : "") + ">" + esc(v) + "</option>").join("");
  }
  function pintarSectores() {
    const fuente = estado.canton ? TODAS.filter(p => p.canton === estado.canton) : TODAS;
    const sectores = unicos(fuente.map(p => p.sector));
    if (estado.sector && sectores.indexOf(estado.sector) === -1) estado.sector = "";
    llenarSelect($("f-sector"), sectores, estado.sector);
  }
  llenarSelect($("f-canton"), unicos(TODAS.map(p => p.canton)), "");

  // ---------- Filtrado ----------
  function filtrar(f) {
    const q = normal(f.buscar).trim();
    const num = v => (v === "" || v == null ? null : Number(v));
    const pmin = num(f.pmin), pmax = num(f.pmax), amin = num(f.amin), amax = num(f.amax);
    return TODAS.filter(p => {
      if (f.tipo && p.tipo !== f.tipo) return false;
      if (f.canton && p.canton !== f.canton) return false;
      if (f.sector && p.sector !== f.sector) return false;
      if (pmin != null && (p.precio == null || p.precio < pmin)) return false;
      if (pmax != null && (p.precio == null || p.precio > pmax)) return false;
      if (amin != null && (p.areaTerreno == null || p.areaTerreno < amin)) return false;
      if (amax != null && (p.areaTerreno == null || p.areaTerreno > amax)) return false;
      if (q) {
        const texto = normal([p.titulo, p.subtipo, p.canton, p.sector, p.provincia, p.codigo, p.descripcion, (p.caracteristicas || []).join(" ")].join(" "));
        if (!q.split(/\s+/).every(w => texto.indexOf(w) !== -1)) return false;
      }
      return true;
    });
  }
  function ordenar(lista) {
    const val = (v, alto) => (v == null ? (alto ? Infinity : -Infinity) : v);
    const l = lista.slice();
    switch (estado.orden) {
      case "precio-asc": l.sort((a, b) => val(a.precio, true) - val(b.precio, true)); break;
      case "precio-desc": l.sort((a, b) => val(b.precio) - val(a.precio)); break;
      case "area-desc": l.sort((a, b) => val(b.areaTerreno) - val(a.areaTerreno)); break;
      case "area-asc": l.sort((a, b) => val(a.areaTerreno, true) - val(b.areaTerreno, true)); break;
    }
    return l;
  }

  function actualizar() {
    pintarTipos();
    pintarSectores();
    const lista = ordenar(filtrar(estado));
    $("grilla").innerHTML = lista.length
      ? lista.map(tarjeta).join("")
      : '<div class="sin-resultados" style="grid-column:1/-1">' + icono("buscar") +
        "<p><strong>No encontramos propiedades con esos filtros.</strong><br>Prueba ampliando el rango de precio o área.</p></div>";
    $("cuenta").innerHTML = "<strong>" + lista.length + "</strong> " + (lista.length === 1 ? "propiedad encontrada" : "propiedades encontradas");
    const hayFiltros = Object.keys(estado).some(k => k !== "orden" && estado[k]);
    $("btn-limpiar").style.visibility = hayFiltros ? "visible" : "hidden";
    guardarURL();
  }

  // ---------- Estado en la URL (para compartir búsquedas) ----------
  function guardarURL() {
    const params = new URLSearchParams();
    Object.keys(estado).forEach(k => { if (estado[k]) params.set(k, estado[k]); });
    const qs = params.toString();
    history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + location.hash);
  }
  function leerURL() {
    const params = new URLSearchParams(location.search);
    Object.keys(estado).forEach(k => { if (params.has(k)) estado[k] = params.get(k); });
    $("f-buscar").value = estado.buscar;
    $("f-canton").value = estado.canton;
    $("f-pmin").value = estado.pmin; $("f-pmax").value = estado.pmax;
    $("f-amin").value = estado.amin; $("f-amax").value = estado.amax;
    $("f-orden").value = estado.orden;
  }

  // ---------- Eventos ----------
  const enlaces = { "f-buscar": "buscar", "f-canton": "canton", "f-sector": "sector", "f-pmin": "pmin", "f-pmax": "pmax", "f-amin": "amin", "f-amax": "amax", "f-orden": "orden" };
  let temporizador;
  Object.keys(enlaces).forEach(id => {
    const el = $(id);
    const ev = el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(ev, () => {
      estado[enlaces[id]] = el.value;
      if (id === "f-canton") estado.sector = "";
      clearTimeout(temporizador);
      temporizador = setTimeout(actualizar, ev === "input" ? 180 : 0);
    });
  });
  $("btn-limpiar").addEventListener("click", () => {
    Object.keys(estado).forEach(k => { if (k !== "orden") estado[k] = ""; });
    ["f-buscar", "f-pmin", "f-pmax", "f-amin", "f-amax"].forEach(id => { $(id).value = ""; });
    $("f-canton").value = "";
    actualizar();
  });
  $("btn-filtros").addEventListener("click", () => {
    const f = $("filtros");
    const abierto = f.classList.toggle("abierto");
    $("btn-filtros").setAttribute("aria-expanded", abierto);
  });

  iniciarComun();
  leerURL();
  actualizar();
})();
