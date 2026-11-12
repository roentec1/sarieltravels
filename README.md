# Viajes Sariel Travels — Sitio Web + Admin con Google Sheets

Todo el contenido dinámico (destinos, promociones, leads, testimonios) se administra desde **Google Sheets** a través de Google Apps Script.

## Páginas del sitio

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Inicio (hero, destinos, promos, servicios, testimonios, contacto) |
| `destinos.html` | Listado completo de destinos (desde Sheets) |
| `promociones.html` | Listado completo de promociones (desde Sheets) |
| `servicios.html` | Catálogo de servicios |
| `nosotros.html` | Por qué elegirnos |
| `contacto.html` | Formulario e información de contacto |

## Panel admin (`/admin/`)

| Archivo | Función |
|---------|---------|
| `index.html` | Login |
| `dashboard.html` | Estadísticas |
| `promociones.html` | CRUD promociones → Google Sheets |
| `destinos.html` | CRUD destinos → Google Sheets |
| `clientes.html` | Leads / solicitudes + cambio de estado |
| `testimonios.html` | Indicaciones hoja TESTIMONIOS |
| `configuracion.html` | Guía de conexión API |

**Login demo:** `admin` / `sariel2026`

## Cómo conectar Google Sheets (obligatorio para producción)

### 1. Crear el Spreadsheet

Crea un Google Sheet y estas pestañas con encabezados en la fila 1:

**CLIENTES**  
`ID | Fecha | Nombre | Telefono | WhatsApp | Correo | Destino | Promocion | FechaViaje | Viajeros | TipoViaje | Presupuesto | Mensaje | Estado | Origen`

**PROMOCIONES**  
`ID | Fecha | Titulo | Destino | Precio | PrecioAnterior | Descuento | FechaSalida | Duracion | Descripcion | Imagen | Vigencia | Estado`

**DESTINOS**  
`ID | Nombre | Pais | Ciudad | Descripcion | Imagen | PrecioDesde | Temporada | Estado`

**TESTIMONIOS**  
`ID | Nombre | Destino | Comentario | Estrellas | Imagen | Estado`

**USUARIOS**  
`ID | Usuario | Password | Nombre | Rol | Estado`  
Fila ejemplo: `1 | admin | sariel2026 | Administrador | admin | activo`

**CONFIGURACION**  
`Clave | Valor`

### 2. Apps Script

1. En el Sheet: **Extensiones → Apps Script**
2. Pega el contenido de `google-apps-script/Code.gs`
3. Cambia: `const SPREADSHEET_ID = 'TU_ID_DEL_SHEET';`
4. **Implementar → Nueva implementación → Aplicación web**
   - Ejecutar como: **Yo**
   - Acceso: **Cualquier persona**
5. Copia la URL que termina en `/exec`

### 3. Conectar el frontend

Abre `assets/js/api.js` y reemplaza:

```js
URL: 'https://script.google.com/macros/s/TU_SCRIPT_ID/exec',
```

por tu URL real.

A partir de ese momento:

- El **sitio público** carga destinos, promociones y testimonios desde Sheets
- Los **formularios** guardan leads en la hoja CLIENTES
- El **admin** crea/edita/elimina promociones y destinos en Sheets
- Si la API no responde, el sitio usa datos de respaldo locales

## Datos de la agencia

- **Nombre:** Viajes Sariel Travels  
- **Ubicación:** Apodaca, Nuevo León, México C.P. 66646  
- **WhatsApp / Tel:** +52 1 81 1534 0059  
- **Eslogan:** Creamos viajes reales  

No se inventaron correos ni redes sociales adicionales. Agrega Facebook/Instagram cuando tengas las URLs oficiales.

## Estructura

```
viajes-sariel/
├── index.html, destinos.html, promociones.html
├── servicios.html, nosotros.html, contacto.html
├── admin/          (panel completo)
├── assets/css/styles.css
├── assets/js/api.js      ← URL de Google Apps Script
├── assets/js/main.js
├── assets/img/logo.jpg
└── google-apps-script/Code.gs
```

## Publicar

Sube la carpeta a cualquier hosting estático (Netlify, Vercel, Hostinger, cPanel).  
No necesitas PHP ni base de datos propia: Google Sheets es el backend.

© 2026 Viajes Sariel Travels
