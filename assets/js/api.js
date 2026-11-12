/**
 * VIAJES SARIEL TRAVELS - Cliente API Google Sheets
 * Comunicación con Google Apps Script
 */

const API = {
  // ⚠️ IMPORTANTE: Reemplaza con la URL de tu Apps Script desplegado
  URL: 'https://script.google.com/macros/s/TU_SCRIPT_ID/exec',

  /**
   * Llamada genérica a la API
   * Para GET usa CORS normal. Para POST usa no-cors (fire-and-forget)
   * porque GAS no siempre devuelve CORS headers en POST externos.
   */
  async call(action, params = {}, method = 'GET') {
    const isGet = method === 'GET';
    
    try {
      if (isGet) {
        const qs = new URLSearchParams({ action, ...params }).toString();
        const res = await fetch(`${this.URL}?${qs}`, {
          method: 'GET',
          redirect: 'follow'
        });
        if (!res.ok) throw new Error('Error de red');
        return await res.json();
      } else {
        // POST: enviamos y asumimos éxito (no-cors no permite leer respuesta)
        await fetch(this.URL, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action, ...params })
        });
        return { success: true, offline: false };
      }
    } catch (err) {
      console.warn('[API]', action, err.message);
      return { success: false, error: err.message, offline: true };
    }
  },

  // ---------- Lecturas (GET) ----------
  getDestinations(estado = 'activo') {
    return this.call('getDestinations', { estado });
  },
  getPromotions(estado = 'activo') {
    return this.call('getPromotions', { estado });
  },
  getTestimonials(estado = 'activo') {
    return this.call('getTestimonials', { estado });
  },
  getClients(estado = '') {
    return this.call('getClients', estado ? { estado } : {});
  },
  getStats() {
    return this.call('getStats');
  },
  getConfig() {
    return this.call('getConfig');
  },

  // ---------- Escrituras (POST) ----------
  registerClient(data) {
    return this.call('registerClient', { data }, 'POST');
  },
  updateClient(id, estado) {
    return this.call('updateClient', { id, estado }, 'POST');
  },
  savePromotion(data) {
    return this.call('savePromotion', { data }, 'POST');
  },
  deletePromotion(id) {
    return this.call('deletePromotion', { id }, 'POST');
  },
  saveDestination(data) {
    return this.call('saveDestination', { data }, 'POST');
  },
  deleteDestination(id) {
    return this.call('deleteDestination', { id }, 'POST');
  },
  saveTestimonial(data) {
    return this.call('saveTestimonial', { data }, 'POST');
  },
  login(usuario, password) {
    return this.call('login', { usuario, password }, 'POST');
  },

  /** Indica si la URL de API ya fue configurada */
  isConfigured() {
    return this.URL && !this.URL.includes('TU_SCRIPT_ID');
  }
};

// Datos de respaldo (se usan solo si la API no responde)
const FALLBACK = {
  destinos: [
    { ID: '1', Nombre: 'Cancún', Pais: 'México', Ciudad: 'Quintana Roo', Descripcion: 'Playas de arena blanca, aguas turquesas y vida nocturna inigualable.', PrecioDesde: 5999, Imagen: 'https://images.unsplash.com/photo-1552074284-5e88f72f8b72?w=600&h=400&fit=crop', Temporada: 'Todo el año', Estado: 'activo' },
    { ID: '2', Nombre: 'Riviera Maya', Pais: 'México', Ciudad: 'Quintana Roo', Descripcion: 'Desde Playa del Carmen hasta Tulum. Ruinas mayas, cenotes y resorts de clase mundial.', PrecioDesde: 6999, Imagen: 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=600&h=400&fit=crop', Temporada: 'Todo el año', Estado: 'activo' },
    { ID: '3', Nombre: 'Los Cabos', Pais: 'México', Ciudad: 'Baja California Sur', Descripcion: 'Donde el desierto se encuentra con el mar. Golf, pesca y atardeceres espectaculares.', PrecioDesde: 8999, Imagen: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop', Temporada: 'Octubre - Mayo', Estado: 'activo' },
    { ID: '4', Nombre: 'Puerto Vallarta', Pais: 'México', Ciudad: 'Jalisco', Descripcion: 'Encanto tradicional, malecón animado y playas del Pacífico.', PrecioDesde: 5499, Imagen: 'https://images.unsplash.com/photo-1587595431973-160d0d94add1?w=600&h=400&fit=crop', Temporada: 'Todo el año', Estado: 'activo' },
    { ID: '5', Nombre: 'Orlando', Pais: 'Estados Unidos', Ciudad: 'Florida', Descripcion: 'La capital mundial de los parques temáticos. Magia y diversión para toda la familia.', PrecioDesde: 14999, Imagen: 'https://images.unsplash.com/photo-1575089972178-0d4c2b1f5e1a?w=600&h=400&fit=crop', Temporada: 'Todo el año', Estado: 'activo' },
    { ID: '6', Nombre: 'Nueva York', Pais: 'Estados Unidos', Ciudad: 'Nueva York', Descripcion: 'La ciudad que nunca duerme. Cultura, gastronomía y Broadway.', PrecioDesde: 18999, Imagen: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600&h=400&fit=crop', Temporada: 'Todo el año', Estado: 'activo' }
  ],
  promociones: [
    { ID: '1', Titulo: 'Escapada Caribeña', Destino: 'Riviera Maya', Precio: 8999, PrecioAnterior: 12999, Descuento: 30, FechaSalida: '2026-12-15', Duracion: '5 días / 4 noches', Descripcion: 'Hotel 4★ todo incluido + traslados + tour a cenote.', Imagen: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?w=600&h=400&fit=crop', Vigencia: '2026-11-30', Estado: 'activo' },
    { ID: '2', Titulo: 'Los Cabos Premium', Destino: 'Los Cabos', Precio: 11999, PrecioAnterior: 15999, Descuento: 25, FechaSalida: '2027-01-20', Duracion: '4 días / 3 noches', Descripcion: 'Resort frente al mar + desayunos + tour al Arco.', Imagen: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop', Vigencia: '2026-12-15', Estado: 'activo' },
    { ID: '3', Titulo: 'Magia en Orlando', Destino: 'Orlando', Precio: 18999, PrecioAnterior: 24999, Descuento: 24, FechaSalida: '2027-03-10', Duracion: '7 días / 6 noches', Descripcion: 'Hotel cerca de parques + tickets Disney o Universal.', Imagen: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&h=400&fit=crop', Vigencia: '2027-01-31', Estado: 'activo' }
  ],
  testimonios: [
    { ID: '1', Nombre: 'María González', Destino: 'Cancún', Comentario: 'Excelente atención desde el primer momento. El paquete fue exactamente como lo prometieron.', Estrellas: 5, Estado: 'activo' },
    { ID: '2', Nombre: 'Carlos Ramírez', Destino: 'Los Cabos', Comentario: 'Viajamos en familia y todo salió perfecto. La atención personalizada hizo la diferencia.', Estrellas: 5, Estado: 'activo' },
    { ID: '3', Nombre: 'Ana y Roberto', Destino: 'Riviera Maya', Comentario: 'Nuestra luna de miel fue inolvidable gracias a Sariel Travels.', Estrellas: 5, Estado: 'activo' },
    { ID: '4', Nombre: 'Familia Hernández', Destino: 'Orlando', Comentario: 'Los niños disfrutaron muchísimo. Organización impecable.', Estrellas: 5, Estado: 'activo' }
  ]
};
