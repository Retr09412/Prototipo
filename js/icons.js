/* ============================================================
   Icons — sprite SVG inline (sin dependencias externas)
   ============================================================ */

const PATHS = {
  home: `<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M9.5 21v-6h5v6"/>`,
  grid: `<rect x="3" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.6"/><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.6"/><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.6"/>`,
  zap: `<path d="M13 2 4 14h7l-1 8 9-12h-7l1-8z"/>`,
  user: `<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 3.6-6.5 8-6.5s8 2.5 8 6.5"/>`,
  cart: `<circle cx="9" cy="20" r="1.6"/><circle cx="18" cy="20" r="1.6"/><path d="M2.5 3h2.6l2.3 12.2a1.6 1.6 0 0 0 1.6 1.3h8.7a1.6 1.6 0 0 0 1.6-1.3L21 7H6"/>`,
  plus: `<path d="M12 5v14M5 12h14"/>`,
  minus: `<path d="M5 12h14"/>`,
  x: `<path d="M6 6l12 12M18 6 6 18"/>`,
  check: `<path d="M4.5 12.5 9.5 17.5 19.5 6.5"/>`,
  checkCircle: `<circle cx="12" cy="12" r="9.2"/><path d="m8 12.3 2.7 2.7L16.2 9.5"/>`,
  clock: `<circle cx="12" cy="12" r="9"/><path d="M12 6.8V12l3.4 2.1"/>`,
  calendar: `<rect x="3.5" y="5" width="17" height="16" rx="2.2"/><path d="M3.5 10h17M8 2.8V6.5M16 2.8V6.5"/>`,
  mapPin: `<path d="M12 21s7-5.7 7-11.4A7 7 0 0 0 5 9.6C5 15.3 12 21 12 21z"/><circle cx="12" cy="9.6" r="2.6"/>`,
  navigation: `<path d="M21 3 3 10.5l8 2.5 2.5 8L21 3z"/>`,
  qr: `<rect x="3.5" y="3.5" width="6.5" height="6.5" rx="1.2"/><rect x="14" y="3.5" width="6.5" height="6.5" rx="1.2"/><rect x="3.5" y="14" width="6.5" height="6.5" rx="1.2"/><path d="M14 14h3v3h-3zM19.5 14H21M14 19.5V21M18 21h3v-3"/>`,
  card: `<rect x="2.5" y="5" width="19" height="14" rx="2.4"/><path d="M2.5 10h19M6 15h4"/>`,
  cash: `<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.8"/><path d="M6 9.5v5M18 9.5v5"/>`,
  star: `<path d="m12 3.4 2.6 5.3 5.8.8-4.2 4.1 1 5.8-5.2-2.7-5.2 2.7 1-5.8L3.6 9.5l5.8-.8L12 3.4z"/>`,
  gift: `<rect x="3.5" y="8.5" width="17" height="4" rx="1.2"/><path d="M5 12.5V21h14v-8.5M12 8.5V21"/><path d="M12 8.5S10.8 3.5 8.2 3.5a2.6 2.6 0 0 0 0 5.2M12 8.5s1.2-5 3.8-5a2.6 2.6 0 0 1 0 5.2"/>`,
  trophy: `<path d="M7 4h10v5.5a5 5 0 0 1-10 0V4z"/><path d="M7 6H4.5a0 0 0 0 0 0 0c0 3 1.4 4.6 3.4 5M17 6h2.5c0 3-1.4 4.6-3.4 5M12 14.5V18M8.5 21h7M9.5 18h5"/>`,
  info: `<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.7v.6"/>`,
  alert: `<path d="M12 3.5 2.8 19.5h18.4L12 3.5z"/><path d="M12 9.5v4.5M12 16.6v.6"/>`,
  chevronRight: `<path d="m9 5 7 7-7 7"/>`,
  chevronLeft: `<path d="m15 5-7 7 7 7"/>`,
  arrowRight: `<path d="M4 12h15M13 6l6 6-6 6"/>`,
  sparkles: `<path d="M12 3.5 13.6 8 18 9.6 13.6 11.2 12 15.7 10.4 11.2 6 9.6 10.4 8 12 3.5z"/><path d="M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z"/>`,
  truck: `<path d="M2.5 7h11v9h-11zM13.5 10.5H18l3 3v2.5h-7.5z"/><circle cx="6.5" cy="18" r="1.8"/><circle cx="16.5" cy="18" r="1.8"/>`,
  refresh: `<path d="M20 11.5A8 8 0 1 0 18.5 16"/><path d="M20 5v6.5h-6"/>`,
  book: `<path d="M4 4.5h6a3 3 0 0 1 3 3V20a2.5 2.5 0 0 0-2.5-2.5H4z"/><path d="M20 4.5h-6a3 3 0 0 0-3 3V20a2.5 2.5 0 0 1 2.5-2.5H20z"/>`,
  building: `<rect x="5" y="3.5" width="14" height="17" rx="1.6"/><path d="M9 7.5h2M13 7.5h2M9 11.5h2M13 11.5h2M10.5 20.5v-4h3v4"/>`,
  utensils: `<path d="M6.5 3v7a2.5 2.5 0 0 0 5 0V3M9 10.5V21"/><path d="M17.5 3c-1.8 1.6-2.5 4-2.5 6.5 0 1.8.9 3 2.5 3.2V21"/>`,
  activity: `<path d="M2.5 12h4l2.5-7 4.5 14 2.5-7h5.5"/>`,
  flame: `<path d="M12 21c4 0 6.5-2.7 6.5-6.2 0-4.4-4.2-6-5.4-11.8C9.5 5.4 5.5 8 5.5 13c0 2.3 1.2 4.2 3 5.2-.4-1.8.6-3.6 2.3-4.4-.2 2.4 1.2 3.4 1.2 5.2 0 1-.7 2-2 2z"/>`,
  search: `<circle cx="11" cy="11" r="6.5"/><path d="m16 16 5 5"/>`,
  ticket: `<path d="M3 8.5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4z"/><path d="M14 6.5v11" stroke-dasharray="2 2.5"/>`,
  logout: `<path d="M14.5 4.5H6.5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h8"/><path d="M11 12h9.5M16.5 8l3.5 4-3.5 4"/>`,
  wallet: `<rect x="3" y="6" width="18" height="13" rx="2.4"/><path d="M3 10h18M16.5 14.5h1.5"/>`,
  bell: `<path d="M6 9.5a6 6 0 0 1 12 0c0 4.5 1.8 5.5 1.8 5.5H4.2S6 14 6 9.5z"/><path d="M10 18.5a2.2 2.2 0 0 0 4 0"/>`,
};

/**
 * Devuelve un SVG inline.
 * @param {string} name clave del icono
 * @param {{size?:number, cls?:string}} [opts]
 */
export function icon(name, opts = {}) {
  const d = PATHS[name] || PATHS.info;
  const size = opts.size || 24;
  return `<svg class="icon ${opts.cls || ""}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
}

export function hasIcon(name) {
  return Boolean(PATHS[name]);
}
