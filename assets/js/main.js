/**
 * VIAJES SARIEL TRAVELS - JavaScript Principal
 * Carga datos desde Google Sheets (API) con fallback local
 */

const CONFIG = {
  WHATSAPP_NUMBER: '5218115340059',
  WHATSAPP_MESSAGE: 'Hola, Viajes Sariel Travels. Me gustaría recibir información sobre sus paquetes y promociones.',
  FACEBOOK_URL: 'https://www.facebook.com/',
  AGENCY: {
    name: 'Viajes Sariel Travels',
    phone: '+52 1 81 1534 0059',
    whatsapp: '+52 1 81 1534 0059',
    address: 'Apodaca, Nuevo León, México, C.P. 66646'
  }
};

// ---------- Utilidades ----------
const $ = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);

function formatPrice(price) {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', minimumFractionDigits: 0 }).format(Number(price) || 0);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

function showToast(message, type = 'success') {
  const existing = $('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i><span>${message}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add('show'), 50);
  setTimeout(() => { toast.classList.remove('show'); setTimeout(() => toast.remove(), 400); }, 4000);
}

function openWhatsApp(customMessage = null) {
  const msg = encodeURIComponent(customMessage || CONFIG.WHATSAPP_MESSAGE);
  window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${msg}`, '_blank');
}

function normalizeDestino(d) {
  return {
    id: d.ID || d.id,
    nombre: d.Nombre || d.nombre,
    pais: d.Pais || d.pais,
    ciudad: d.Ciudad || d.ciudad,
    descripcion: d.Descripcion || d.descripcion,
    precioDesde: d.PrecioDesde || d.precioDesde || 0,
    imagen: d.Imagen || d.imagen || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
    temporada: d.Temporada || d.temporada || 'Disponible',
    estado: d.Estado || d.estado
  };
}

function normalizePromo(p) {
  return {
    id: p.ID || p.id,
    titulo: p.Titulo || p.titulo,
    destino: p.Destino || p.destino,
    precio: p.Precio || p.precio || 0,
    precioAnterior: p.PrecioAnterior || p.precioAnterior || 0,
    descuento: p.Descuento || p.descuento || 0,
    fechaSalida: p.FechaSalida || p.fechaSalida,
    duracion: p.Duracion || p.duracion,
    descripcion: p.Descripcion || p.descripcion,
    imagen: p.Imagen || p.imagen || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
    vigencia: p.Vigencia || p.vigencia,
    estado: p.Estado || p.estado
  };
}

function normalizeTestimonio(t) {
  return {
    id: t.ID || t.id,
    nombre: t.Nombre || t.nombre,
    destino: t.Destino || t.destino,
    comentario: t.Comentario || t.comentario,
    estrellas: Number(t.Estrellas || t.estrellas || 5),
    estado: t.Estado || t.estado
  };
}

// ---------- Header ----------
function initHeader() {
  const header = $('.header');
  const toggle = $('.nav-toggle') || $('#nav-toggle');
  const menu = $('.nav-menu') || $('#nav-menu');
  if (!header) return;

  let overlay = $('.nav-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
  }

  function openMenu() {
    toggle && toggle.classList.add('active');
    menu && menu.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    toggle && toggle.setAttribute('aria-expanded', 'true');
  }

  function closeMenu() {
    toggle && toggle.classList.remove('active');
    menu && menu.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
    toggle && toggle.setAttribute('aria-expanded', 'false');
  }

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 40);
  });

  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      if (menu.classList.contains('active')) closeMenu();
      else openMenu();
    });
    overlay.addEventListener('click', closeMenu);
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => closeMenu());
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 992) closeMenu();
    });
  }
}

// ---------- Hero slider ----------
function initHeroSlider() {
  const slides = $$('.hero-slide');
  const dots = $$('.hero-dot');
  if (!slides.length) return;

  let current = 0;
  let timer;

  function goTo(i) {
    slides[current].classList.remove('active');
    dots[current]?.classList.remove('active');
    current = (i + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current]?.classList.add('active');
  }

  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);
  const start = () => { timer = setInterval(next, 6000); };
  const stop = () => clearInterval(timer);

  $('.hero-arrow.next')?.addEventListener('click', () => { stop(); next(); start(); });
  $('.hero-arrow.prev')?.addEventListener('click', () => { stop(); prev(); start(); });
  dots.forEach((d, i) => d.addEventListener('click', () => { stop(); goTo(i); start(); }));
  $('.hero')?.addEventListener('mouseenter', stop);
  $('.hero')?.addEventListener('mouseleave', start);
  start();
}

// ---------- Scroll animations ----------
function initScrollAnimations() {
  const els = $$('.fade-in');
  if (!els.length) return;
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(el => obs.observe(el));
}

// ---------- Modal solicitud ----------
function initModal() {
  const overlay = $('#modal-solicitud');
  if (!overlay) return;
  const form = overlay.querySelector('form');

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open-modal]');
    if (!btn) return;
    e.preventDefault();
    const promo = btn.dataset.promo || '';
    const destino = btn.dataset.destino || '';
    const pi = form.querySelector('[name="promocion"]');
    const di = form.querySelector('[name="destino"]');
    if (pi) pi.value = promo;
    if (di && destino) di.value = destino;
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  function close() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
  overlay.querySelector('.modal-close')?.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    const data = Object.fromEntries(new FormData(form).entries());
    data.fecha = new Date().toISOString();
    data.estado = 'Nuevo';
    data.origen = 'Modal solicitud';

    await enviarLead(data);
    form.reset();
    close();
    btn.disabled = false;
    btn.innerHTML = original;
  });
}

// ---------- Formulario contacto ----------
function initContactForm() {
  const form = $('#form-contacto');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    const data = Object.fromEntries(new FormData(form).entries());
    data.fecha = new Date().toISOString();
    data.estado = 'Nuevo';
    data.origen = 'Formulario de Contacto';

    await enviarLead(data);
    form.reset();
    btn.disabled = false;
    btn.innerHTML = original;
  });
}

async function enviarLead(data) {
  // Siempre guardar local como respaldo
  const leads = JSON.parse(localStorage.getItem('sariel_leads') || '[]');
  data.id = data.id || (Date.now().toString(36) + Math.random().toString(36).slice(2, 7));
  leads.push(data);
  localStorage.setItem('sariel_leads', JSON.stringify(leads));

  // Enviar a Google Sheets
  if (typeof API !== 'undefined' && API.isConfigured()) {
    await API.registerClient(data);
  }

  showToast('¡Gracias por contactar a Viajes Sariel Travels! Hemos recibido tu solicitud. Uno de nuestros asesores se pondrá en contacto contigo.');
}

// ---------- Render desde datos ----------
function renderDestinos(containerId, items, limit = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let list = (items || []).map(normalizeDestino).filter(d => d.estado !== 'inactivo');
  if (limit) list = list.slice(0, limit);

  if (!list.length) {
    container.innerHTML = '<p class="text-center" style="grid-column:1/-1;color:var(--gray);">Pronto publicaremos nuevos destinos.</p>';
    return;
  }

  container.innerHTML = list.map(d => `
    <article class="destino-card fade-in">
      <div class="destino-img">
        <img src="${d.imagen}" alt="${d.nombre} - Viajes Sariel Travels" loading="lazy">
        <span class="destino-badge">${d.temporada}</span>
      </div>
      <div class="destino-body">
        <div class="destino-location"><i class="fas fa-map-marker-alt"></i> ${d.pais || ''}</div>
        <h3 class="destino-name">${d.nombre}</h3>
        <p class="destino-desc">${d.descripcion || ''}</p>
        <div class="destino-footer">
          <div class="destino-price"><span>Desde</span><br>${formatPrice(d.precioDesde)}</div>
          <a href="#" class="btn btn-primary btn-sm" data-open-modal data-destino="${d.nombre}">Solicitar info</a>
        </div>
      </div>
    </article>
  `).join('');

  initScrollAnimations();
}

function renderPromociones(containerId, items, limit = null) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let list = (items || []).map(normalizePromo).filter(p => p.estado !== 'inactivo');
  if (limit) list = list.slice(0, limit);

  if (!list.length) {
    container.innerHTML = '<p class="text-center" style="grid-column:1/-1;color:var(--gray);">No hay promociones activas por el momento.</p>';
    return;
  }

  container.innerHTML = list.map(p => `
    <article class="promo-card fade-in">
      <div class="promo-img">
        <img src="${p.imagen}" alt="${p.titulo}" loading="lazy">
        ${p.descuento ? `<div class="promo-discount">-${p.descuento}%</div>` : ''}
      </div>
      <div class="promo-body">
        <div class="promo-destination">${p.destino || ''}</div>
        <h3 class="promo-title">${p.titulo}</h3>
        <div class="promo-details">
          ${p.duracion ? `<span><i class="fas fa-calendar-alt"></i> ${p.duracion}</span>` : ''}
          ${p.fechaSalida ? `<span><i class="fas fa-plane-departure"></i> ${formatDate(p.fechaSalida)}</span>` : ''}
        </div>
        <p style="font-size:0.9rem;color:var(--text-light);margin-bottom:16px;">${p.descripcion || ''}</p>
        <div class="promo-price-box">
          <span class="promo-price">${formatPrice(p.precio)}</span>
          ${p.precioAnterior ? `<span class="promo-old-price">${formatPrice(p.precioAnterior)}</span>` : ''}
        </div>
        <div class="promo-actions">
          <button class="btn btn-accent" data-open-modal data-promo="${p.titulo}" data-destino="${p.destino || ''}">
            <i class="fas fa-info-circle"></i> QUIERO INFORMACIÓN
          </button>
        </div>
      </div>
    </article>
  `).join('');

  initScrollAnimations();
}

function renderTestimonios(items) {
  const container = document.getElementById('testimonios-track');
  if (!container) return;

  const list = (items || []).map(normalizeTestimonio).filter(t => t.estado !== 'inactivo');
  if (!list.length) return;

  container.innerHTML = list.map(t => `
    <div class="testimonio-card">
      <div class="testimonio-stars">${'<i class="fas fa-star"></i>'.repeat(Math.min(5, t.estrellas))}</div>
      <p class="testimonio-text">"${t.comentario}"</p>
      <div class="testimonio-author">
        <div class="testimonio-avatar">${(t.nombre || 'C').charAt(0)}</div>
        <div class="testimonio-info">
          <h4>${t.nombre}</h4>
          <span>${t.destino || ''}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// ---------- Carga de datos desde Google Sheets ----------
async function loadPublicData() {
  let destinos = FALLBACK.destinos;
  let promociones = FALLBACK.promociones;
  let testimonios = FALLBACK.testimonios;

  if (typeof API !== 'undefined' && API.isConfigured()) {
    const [dRes, pRes, tRes] = await Promise.all([
      API.getDestinations('activo'),
      API.getPromotions('activo'),
      API.getTestimonials('activo')
    ]);

    if (dRes.success && dRes.data?.length) destinos = dRes.data;
    if (pRes.success && pRes.data?.length) promociones = pRes.data;
    if (tRes.success && tRes.data?.length) testimonios = tRes.data;
  }

  // Detectar página y límite
  const isHome = !!document.getElementById('destinos-grid') && window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname === '';
  const destinosLimit = document.body.dataset.destinosLimit ? Number(document.body.dataset.destinosLimit) : (isHome ? 6 : null);
  const promosLimit = document.body.dataset.promosLimit ? Number(document.body.dataset.promosLimit) : (isHome ? 3 : null);

  renderDestinos('destinos-grid', destinos, destinosLimit);
  renderPromociones('promos-grid', promociones, promosLimit);
  renderTestimonios(testimonios);
}

// ---------- Init ----------
document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initHeroSlider();
  initScrollAnimations();
  initModal();
  initContactForm();
  loadPublicData();

  $$('[data-whatsapp]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openWhatsApp(btn.dataset.message || null);
    });
  });
});
