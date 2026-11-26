# Guía del panel de propiedades — Andagana Corporación

El panel sirve para agregar, editar y marcar propiedades desde el navegador o el celular, sin tocar código. Funciona con **Pages CMS**. Cada vez que guardas algo, la página pública se actualiza sola en **1 a 2 minutos**.

- Panel: **https://app.pagescms.org**
- Página pública: **https://julianlligalo.github.io/andagana-web/**

> La pantalla del panel está en inglés. En esta guía, el nombre de cada botón en inglés va entre comillas, por ejemplo «Save» (Guardar).

---

## 1. Cómo entrar al panel

**Si eres el dueño de la cuenta de GitHub (solo la primera vez):**

1. Abre **https://app.pagescms.org** y toca «Sign in with GitHub».
2. Autoriza Pages CMS e instala la aplicación de GitHub. Cuando pregunte a qué repositorios dar acceso, elige **andagana-web**.
3. Vuelve al panel y abre el repositorio **andagana-web**.

**Si eres un asesor invitado:**

1. Abre el correo de invitación de Pages CMS y sigue el enlace.
2. Entra con tu correo electrónico. No necesitas cuenta de GitHub.
3. Abre **andagana-web**.

En el menú de la izquierda verás:

- **Propiedades**: la lista de todas las propiedades, con buscador.
- **⚠️ Revisión de errores**: avisos automáticos, por ejemplo un código repetido o una propiedad sin precio.

En el celular, el menú se abre con el botón ☰.

---

## 2. Cómo agregar una propiedad paso a paso

1. Entra a **Propiedades** y toca «Add an entry» (Agregar).
2. Llena los datos. Los campos marcados como obligatorios son Código, Título, Tipo, Operación, Cantón, Oficina, Estado y Foto principal.
   - **Código**: el del catálogo, por ejemplo `00025CE`. Debe ser único.
   - **Oficina responsable**: el botón de WhatsApp de la propiedad irá al número de esa oficina.
     - Ambato: 099 267 4556
     - Quito: 096 182 3598
   - **Precio (USD)**: solo el número, sin puntos ni $, por ejemplo `59000`. Si no quieres mostrarlo, déjalo vacío y activa **Consultar precio**.
   - **Áreas**: solo el número de m², por ejemplo `1142`.
   - **Características**: elige de la lista. Lo que no esté, escríbelo en **Otras características**, una por línea.
   - **Enlace de Google Maps** (opcional):
     1. En la app de Google Maps, busca el lugar y toca «Compartir».
     2. Copia el enlace y pégalo aquí.
     3. Si lo dejas vacío, el mapa muestra el sector.
3. **Fotos**:
   - En **Foto principal**, toca «Upload» y elige la foto de la tarjeta.
   - En **Galería de fotos**, sube las demás. Puedes elegir varias a la vez.
   - Puedes subir las fotos tal como salen del celular: la página las reduce y comprime sola.
4. Toca «Save» (Guardar).
5. Espera 1 a 2 minutos y revisa la página pública.
6. Si la propiedad no aparece como esperabas, mira **⚠️ Revisión de errores** en el panel.

**Para editar** una propiedad, búscala en la lista, ábrela, cambia lo que necesites y toca «Save».

**Destacada**: actívala para que la propiedad salga primero en la página, con una etiqueta dorada.

---

## 3. Cómo marcarla como vendida (o reservada)

1. Abre la propiedad en **Propiedades**.
2. En **Estado**, elige **Vendida** o **Reservada**.
3. Toca «Save».

En 1 a 2 minutos la página muestra:

- una franja **VENDIDA** (roja) o **RESERVADA** (dorada) sobre la foto;
- las vendidas, al final de la lista.

El botón de WhatsApp de una propiedad vendida invita al cliente a pedir opciones similares.

Si prefieres quitarla de la página por completo, ábrela y bórrala con «Delete». Ten en cuenta que se borra para siempre del panel. Marcarla como vendida es más seguro.

---

## 4. Cómo dar acceso a otro asesor

**Opción A: con su correo (recomendada, no necesita GitHub)**

1. Entra al panel con la cuenta de GitHub del dueño.
2. Abre **andagana-web** y busca la sección de colaboradores («Collaborators»).
3. Escribe el correo del asesor y envía la invitación.
4. El asesor recibe un correo y entra con él.

Los asesores invitados pueden agregar y editar propiedades y fotos. No pueden cambiar la configuración del panel ni invitar a otras personas. El nombre de quien guardó cada cambio queda registrado.

**Opción B: si el asesor tiene cuenta de GitHub**

1. En GitHub, abre el repositorio **andagana-web**.
2. Ve a **Settings → Collaborators → Add people** y escribe su usuario.
3. Cuando acepte, entra al panel con «Sign in with GitHub».

Esta opción le da acceso completo al código, así que úsala solo con personas de confianza.

Para **quitar el acceso**, borra al asesor de la misma lista de colaboradores donde lo agregaste.

---

## Si algo sale mal

- **Hay un aviso en «⚠️ Revisión de errores»**: dice qué propiedad revisar y qué pasa. Por ejemplo, «El código 0000CA está repetido» o «no tiene precio ni Consultar precio». Corrígela y guarda; el aviso desaparece solo.
  - La página nunca se cae por estos errores: una propiedad sin precio se muestra como «Consultar precio» hasta que la corrijas.
  - El dueño también recibe el aviso en GitHub, en la pestaña **Issues**.
- **Guardé y no veo el cambio**: espera 2 minutos y recarga la página. En el celular, desliza hacia abajo para recargar.
- **Datos generales** como el WhatsApp principal, las oficinas y las redes sociales no se editan en el panel. Están en el archivo `data/empresa.js`.
