/* ==========================================================
   Contador de visitas con GoatCounter (andagana.goatcounter.com)
   - Cuenta cada página que se visita (no usa cookies).
   - Muestra el total del sitio en el pie de página: "👁 1.245 visitas".
   - Si GoatCounter no responde, el contador simplemente no aparece.
   ========================================================== */
(function () {
  "use strict";
  var SITIO = "https://andagana.goatcounter.com";

  // 1. Registrar la visita
  var s = document.createElement("script");
  s.async = true;
  s.src = "https://gc.zgo.at/count.js";
  s.setAttribute("data-goatcounter", SITIO + "/count");
  document.head.appendChild(s);

  // 2. Mostrar el total del sitio
  function mostrarTotal() {
    var el = document.getElementById("contador-visitas");
    if (!el || !window.fetch) return;
    var control = window.AbortController ? new AbortController() : null;
    var limite = setTimeout(function () { if (control) control.abort(); }, 8000);
    fetch(SITIO + "/counter/TOTAL.json", control ? { signal: control.signal } : {})
      .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(function (d) {
        clearTimeout(limite);
        // GoatCounter devuelve el número con separadores ("1,245" o "1 245"): se deja solo la cifra
        var n = parseInt(String(d && d.count != null ? d.count : "").replace(/\D/g, ""), 10);
        if (isNaN(n)) return;
        var cifra = new Intl.NumberFormat("es-EC").format(n).replace(/[,\s  ]/g, ".");
        el.innerHTML = '<span aria-hidden="true">👁</span> ' + cifra + (n === 1 ? " visita" : " visitas");
        el.setAttribute("aria-label", cifra + (n === 1 ? " visita" : " visitas") + " al sitio");
        el.hidden = false;
      })
      .catch(function () { clearTimeout(limite); /* sin contador */ });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mostrarTotal);
  else mostrarTotal();
})();
