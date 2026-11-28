/* ==========================================================
   Datos de la empresa: WhatsApp principal, redes y oficinas.
   Se usan en todas las páginas. Este archivo SÍ se edita a mano.
   (Las propiedades están en data/propiedades/*.json y se editan desde el panel.)
   ========================================================== */
/* Datos de contacto de la empresa (se usan en toda la web) */
window.ANDAGANA = {
  nombre: "Andagana Corporación",
  eslogan: "Financiamos oportunidades, entregamos hogares.",
  whatsapp: "593992674556",           // número en formato internacional, sin "+" ni espacios
  whatsappVisible: "+593 99 267 4556",
  telefonoLocal: "0992674556",
  whatsappReferidos: "593982011648", // asesor que recibe la copia de "Recomienda y gana" (paso 2)
  direccion: "Luis Ernesto Alvarado y Marcos Montalvo, Ambato",
  /* Oficinas: aparecen en la sección "Nuestras oficinas" y en el pie de página.
     "mapa" es el texto que se busca en Google Maps (puede ser más corto que la dirección). */
  oficinas: [
    {
      id: "ambato",
      tipo: "Matriz",
      nombre: "Matriz Ambato",
      direccion: "Luis Ernesto Alvarado y Marcos Montalvo, Ambato",
      mapa: "Luis Ernesto Alvarado y Marcos Montalvo, Ambato, Ecuador",
      whatsapp: "593992674556",
      telefono: "0992674556",
      telefonoVisible: "099 267 4556"
    },
    {
      id: "quito",
      tipo: "Sucursal",
      nombre: "Sucursal Quito",
      direccion: "Av. Mariscal Sucre, entre Morán Valverde y Matilde Álvarez, frente al mercado Las Cuadras, sector Chillogallo, Quito",
      mapa: "Mercado Las Cuadras, Av. Mariscal Sucre, Chillogallo, Quito, Ecuador",
      whatsapp: "593961823598",
      telefono: "0961823598",
      telefonoVisible: "096 182 3598"
    }
  ],
  facebook: "https://www.facebook.com/profile.php?id=61591559723514",
  tiktok: "https://www.tiktok.com/@corporacion.andagana"
};
