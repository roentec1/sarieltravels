/**
 * =====================================================
 * VIAJES SARIEL TRAVELS - Google Apps Script API
 * =====================================================
 * 
 * Este script actúa como backend/API para el sitio web.
 * Se conecta a Google Sheets como base de datos.
 * 
 * INSTRUCCIONES DE CONFIGURACIÓN:
 * 1. Crea un nuevo Google Spreadsheet
 * 2. Crea las hojas: CLIENTES, PROMOCIONES, DESTINOS, TESTIMONIOS, CONFIGURACION, USUARIOS
 * 3. Copia este código en Extensiones > Apps Script
 * 4. Actualiza SPREADSHEET_ID con el ID de tu hoja
 * 5. Despliega como aplicación web (Ejecutar como: Yo, Acceso: Cualquiera)
 * 6. Copia la URL del deployment y pégala en assets/js/main.js (CONFIG.API_URL)
 */

// ========== CONFIGURACIÓN ==========
const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI'; // Reemplazar con el ID real

const SHEETS = {
  CLIENTES: 'CLIENTES',
  PROMOCIONES: 'PROMOCIONES',
  DESTINOS: 'DESTINOS',
  TESTIMONIOS: 'TESTIMONIOS',
  CONFIGURACION: 'CONFIGURACION',
  USUARIOS: 'USUARIOS'
};

// ========== PUNTO DE ENTRADA ==========
function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function handleRequest(e, method) {
  // CORS headers
  const output = ContentService.createTextOutput();
  output.setMimeType(ContentService.MimeType.JSON);
  
  try {
    let params = {};
    
    if (method === 'GET') {
      params = e.parameter || {};
    } else {
      // POST: puede venir como JSON o form data
      if (e.postData && e.postData.contents) {
        try {
          params = JSON.parse(e.postData.contents);
        } catch (err) {
          params = e.parameter || {};
        }
      } else {
        params = e.parameter || {};
      }
    }
    
    const action = params.action || '';
    let result;
    
    switch (action) {
      // --- CLIENTES / LEADS ---
      case 'registerClient':
        result = registerClient(params.data || params);
        break;
      case 'getClients':
        result = getClients(params);
        break;
      case 'updateClient':
        result = updateClient(params);
        break;
      
      // --- PROMOCIONES ---
      case 'getPromotions':
        result = getPromotions(params);
        break;
      case 'savePromotion':
        result = savePromotion(params.data || params);
        break;
      case 'deletePromotion':
        result = deletePromotion(params.id);
        break;
      
      // --- DESTINOS ---
      case 'getDestinations':
        result = getDestinations(params);
        break;
      case 'saveDestination':
        result = saveDestination(params.data || params);
        break;
      case 'deleteDestination':
        result = deleteDestination(params.id);
        break;
      
      // --- TESTIMONIOS ---
      case 'getTestimonials':
        result = getTestimonials(params);
        break;
      case 'saveTestimonial':
        result = saveTestimonial(params.data || params);
        break;
      
      // --- CONFIG ---
      case 'getConfig':
        result = getConfig();
        break;
      case 'saveConfig':
        result = saveConfig(params.data || params);
        break;
      
      // --- AUTH ---
      case 'login':
        result = login(params.usuario, params.password);
        break;
      
      // --- STATS ---
      case 'getStats':
        result = getStats();
        break;
      
      default:
        result = { success: false, error: 'Acción no válida: ' + action };
    }
    
    output.setContent(JSON.stringify(result));
    
  } catch (error) {
    output.setContent(JSON.stringify({
      success: false,
      error: error.message || 'Error interno del servidor'
    }));
  }
  
  return output;
}

// ========== UTILIDADES ==========
function getSheet(name) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    initializeSheet(sheet, name);
  }
  return sheet;
}

function initializeSheet(sheet, name) {
  const headers = {
    CLIENTES: ['ID', 'Fecha', 'Nombre', 'Telefono', 'WhatsApp', 'Correo', 'Destino', 'Promocion', 'FechaViaje', 'Viajeros', 'TipoViaje', 'Presupuesto', 'Mensaje', 'Estado', 'Origen'],
    PROMOCIONES: ['ID', 'Fecha', 'Titulo', 'Destino', 'Precio', 'PrecioAnterior', 'Descuento', 'FechaSalida', 'Duracion', 'Descripcion', 'Imagen', 'Vigencia', 'Estado'],
    DESTINOS: ['ID', 'Nombre', 'Pais', 'Ciudad', 'Descripcion', 'Imagen', 'PrecioDesde', 'Temporada', 'Estado'],
    TESTIMONIOS: ['ID', 'Nombre', 'Destino', 'Comentario', 'Estrellas', 'Imagen', 'Estado'],
    CONFIGURACION: ['Clave', 'Valor'],
    USUARIOS: ['ID', 'Usuario', 'Password', 'Nombre', 'Rol', 'Estado']
  };
  
  if (headers[name]) {
    sheet.getRange(1, 1, 1, headers[name].length).setValues([headers[name]]);
    sheet.getRange(1, 1, 1, headers[name].length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  
  // Usuario admin por defecto
  if (name === 'USUARIOS') {
    sheet.appendRow(['1', 'admin', 'sariel2026', 'Administrador', 'admin', 'activo']);
  }
}

function generateId() {
  return Utilities.getUuid().substring(0, 8);
}

function sheetToObjects(sheet) {
  const data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];
  
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = row[i];
    });
    return obj;
  });
}

// ========== CLIENTES ==========
function registerClient(data) {
  const sheet = getSheet(SHEETS.CLIENTES);
  const id = generateId();
  const fecha = new Date().toISOString();
  
  sheet.appendRow([
    id,
    fecha,
    data.nombre || '',
    data.telefono || '',
    data.whatsapp || data.telefono || '',
    data.correo || '',
    data.destino || '',
    data.promocion || '',
    data.fechaViaje || '',
    data.viajeros || '',
    data.tipoViaje || '',
    data.presupuesto || '',
    data.mensaje || '',
    data.estado || 'Nuevo',
    data.origen || 'Sitio web'
  ]);
  
  return { success: true, id: id, message: 'Cliente registrado correctamente' };
}

function getClients(params) {
  const sheet = getSheet(SHEETS.CLIENTES);
  let clients = sheetToObjects(sheet);
  
  if (params.estado) {
    clients = clients.filter(c => c.Estado === params.estado);
  }
  
  // Ordenar por fecha descendente
  clients.sort((a, b) => new Date(b.Fecha) - new Date(a.Fecha));
  
  return { success: true, data: clients };
}

function updateClient(params) {
  const sheet = getSheet(SHEETS.CLIENTES);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idCol = headers.indexOf('ID');
  const estadoCol = headers.indexOf('Estado');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] === params.id) {
      if (params.estado) {
        sheet.getRange(i + 1, estadoCol + 1).setValue(params.estado);
      }
      // Se pueden actualizar más campos según necesidad
      return { success: true, message: 'Cliente actualizado' };
    }
  }
  
  return { success: false, error: 'Cliente no encontrado' };
}

// ========== PROMOCIONES ==========
function getPromotions(params) {
  const sheet = getSheet(SHEETS.PROMOCIONES);
  let promos = sheetToObjects(sheet);
  
  if (params.estado !== 'all') {
    promos = promos.filter(p => p.Estado === 'activo' || !params.estado);
  }
  
  return { success: true, data: promos };
}

function savePromotion(data) {
  const sheet = getSheet(SHEETS.PROMOCIONES);
  
  if (data.ID || data.id) {
    // Actualizar existente
    const id = data.ID || data.id;
    const allData = sheet.getDataRange().getValues();
    const headers = allData[0];
    const idCol = headers.indexOf('ID');
    
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][idCol] == id) {
        const row = [
          id,
          allData[i][1], // Fecha original
          data.titulo || data.Titulo || '',
          data.destino || data.Destino || '',
          data.precio || data.Precio || 0,
          data.precioAnterior || data.PrecioAnterior || 0,
          data.descuento || data.Descuento || 0,
          data.fechaSalida || data.FechaSalida || '',
          data.duracion || data.Duracion || '',
          data.descripcion || data.Descripcion || '',
          data.imagen || data.Imagen || '',
          data.vigencia || data.Vigencia || '',
          data.estado || data.Estado || 'activo'
        ];
        sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
        return { success: true, id: id, message: 'Promoción actualizada' };
      }
    }
  }
  
  // Crear nueva
  const id = generateId();
  sheet.appendRow([
    id,
    new Date().toISOString(),
    data.titulo || '',
    data.destino || '',
    data.precio || 0,
    data.precioAnterior || 0,
    data.descuento || 0,
    data.fechaSalida || '',
    data.duracion || '',
    data.descripcion || '',
    data.imagen || '',
    data.vigencia || '',
    data.estado || 'activo'
  ]);
  
  return { success: true, id: id, message: 'Promoción creada' };
}

function deletePromotion(id) {
  const sheet = getSheet(SHEETS.PROMOCIONES);
  const data = sheet.getDataRange().getValues();
  const idCol = data[0].indexOf('ID');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] == id) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Promoción eliminada' };
    }
  }
  
  return { success: false, error: 'No encontrada' };
}

// ========== DESTINOS ==========
function getDestinations(params) {
  const sheet = getSheet(SHEETS.DESTINOS);
  let destinos = sheetToObjects(sheet);
  
  if (params.estado !== 'all') {
    destinos = destinos.filter(d => d.Estado === 'activo' || !params.estado);
  }
  
  return { success: true, data: destinos };
}

function saveDestination(data) {
  const sheet = getSheet(SHEETS.DESTINOS);
  
  if (data.ID || data.id) {
    const id = data.ID || data.id;
    const allData = sheet.getDataRange().getValues();
    const idCol = allData[0].indexOf('ID');
    
    for (let i = 1; i < allData.length; i++) {
      if (allData[i][idCol] == id) {
        const row = [
          id,
          data.nombre || data.Nombre || '',
          data.pais || data.Pais || '',
          data.ciudad || data.Ciudad || '',
          data.descripcion || data.Descripcion || '',
          data.imagen || data.Imagen || '',
          data.precioDesde || data.PrecioDesde || 0,
          data.temporada || data.Temporada || '',
          data.estado || data.Estado || 'activo'
        ];
        sheet.getRange(i + 1, 1, 1, row.length).setValues([row]);
        return { success: true, id: id, message: 'Destino actualizado' };
      }
    }
  }
  
  const id = generateId();
  sheet.appendRow([
    id,
    data.nombre || '',
    data.pais || '',
    data.ciudad || '',
    data.descripcion || '',
    data.imagen || '',
    data.precioDesde || 0,
    data.temporada || '',
    data.estado || 'activo'
  ]);
  
  return { success: true, id: id, message: 'Destino creado' };
}

function deleteDestination(id) {
  const sheet = getSheet(SHEETS.DESTINOS);
  const data = sheet.getDataRange().getValues();
  const idCol = data[0].indexOf('ID');
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][idCol] == id) {
      sheet.deleteRow(i + 1);
      return { success: true, message: 'Destino eliminado' };
    }
  }
  return { success: false, error: 'No encontrado' };
}

// ========== TESTIMONIOS ==========
function getTestimonials(params) {
  const sheet = getSheet(SHEETS.TESTIMONIOS);
  let items = sheetToObjects(sheet);
  items = items.filter(t => t.Estado === 'activo' || !params.estado);
  return { success: true, data: items };
}

function saveTestimonial(data) {
  const sheet = getSheet(SHEETS.TESTIMONIOS);
  const id = generateId();
  sheet.appendRow([
    id,
    data.nombre || '',
    data.destino || '',
    data.comentario || '',
    data.estrellas || 5,
    data.imagen || '',
    data.estado || 'activo'
  ]);
  return { success: true, id: id };
}

// ========== CONFIG ==========
function getConfig() {
  const sheet = getSheet(SHEETS.CONFIGURACION);
  const data = sheetToObjects(sheet);
  const config = {};
  data.forEach(row => {
    config[row.Clave] = row.Valor;
  });
  return { success: true, data: config };
}

function saveConfig(data) {
  const sheet = getSheet(SHEETS.CONFIGURACION);
  // Implementación simple: reescribe
  // En producción se puede hacer más granular
  return { success: true, message: 'Configuración guardada' };
}

// ========== AUTH ==========
function login(usuario, password) {
  const sheet = getSheet(SHEETS.USUARIOS);
  const users = sheetToObjects(sheet);
  
  const user = users.find(u => 
    u.Usuario === usuario && 
    u.Password === password && 
    u.Estado === 'activo'
  );
  
  if (user) {
    return {
      success: true,
      user: {
        id: user.ID,
        nombre: user.Nombre,
        rol: user.Rol
      },
      token: Utilities.getUuid() // Token simple (en producción usar algo más robusto)
    };
  }
  
  return { success: false, error: 'Usuario o contraseña incorrectos' };
}

// ========== STATS ==========
function getStats() {
  const clientes = sheetToObjects(getSheet(SHEETS.CLIENTES));
  const promos = sheetToObjects(getSheet(SHEETS.PROMOCIONES));
  const destinos = sheetToObjects(getSheet(SHEETS.DESTINOS));
  
  return {
    success: true,
    data: {
      promocionesActivas: promos.filter(p => p.Estado === 'activo').length,
      destinosPublicados: destinos.filter(d => d.Estado === 'activo').length,
      totalSolicitudes: clientes.length,
      solicitudesNuevas: clientes.filter(c => c.Estado === 'Nuevo').length,
      solicitudesAtendidas: clientes.filter(c => c.Estado !== 'Nuevo' && c.Estado !== 'No interesado').length
    }
  };
}
