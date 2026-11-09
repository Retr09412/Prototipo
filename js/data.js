/* ============================================================
   Data — datos simulados del prototipo (mock)
   ============================================================ */

export const USER = {
  name: "Nicola Herrera",
  shortName: "Nicola",
  initials: "NH",
  id: "1722085",
  career: "Ingeniería en Software",
  email: "n.herrera@espol.edu.ec",
  points: 340,
};

/* ---------- Puntos de recogida predefinidos ---------- */
/* schedule: días laborables (1=Lun … 7=Dom) con hora de apertura/cierre */
export const PICKUP_POINTS = [
  {
    id: "biblioteca",
    name: "Biblioteca Central",
    desc: "Frente a la entrada principal · Piso 1",
    icon: "book",
    schedule: { days: [1, 2, 3, 4, 5], open: "07:30", close: "19:00" },
    slotInterval: 30,
  },
  {
    id: "bloque4",
    name: "Bloque 4 — Ingeniería",
    desc: "Pasillo central, junto a laboratorios",
    icon: "building",
    schedule: { days: [1, 2, 3, 4, 5], open: "08:00", close: "18:00" },
    slotInterval: 30,
  },
  {
    id: "comedor",
    name: "Comedor Central",
    desc: "Acceso norte, junto al área verde",
    icon: "utensils",
    schedule: { days: [1, 2, 3, 4, 5, 6], open: "07:00", close: "20:00" },
    slotInterval: 30,
  },
  {
    id: "deportes",
    name: "Canchas Deportivas",
    desc: "Grada principal · Solo tardes",
    icon: "activity",
    schedule: { days: [1, 2, 3, 4, 5, 6], open: "14:00", close: "18:00" },
    slotInterval: 30,
  },
];

/* ---------- Catálogo (reservable) ---------- */
export const PRODUCTS = [
  {
    id: "sand-pollo",
    name: "Sándwich Integral de Pollo",
    desc: "Pan integral, pollo grillado, vegetales frescos y aliño de la casa.",
    category: "sandwich",
    price: 2.5,
    stock: 14,
    emoji: "🥪",
    reservable: true,
    tags: ["Proteína", "Fresco"],
  },
  {
    id: "sand-atun",
    name: "Sándwich Integral de Atún",
    desc: "Mezcla de atún con apio, mayonesa ligera y lechuga crocante.",
    category: "sandwich",
    price: 2.4,
    stock: 8,
    emoji: "🥖",
    reservable: true,
    tags: ["Proteína"],
  },
  {
    id: "sand-veggie",
    name: "Sándwich Vegetariano",
    desc: "Hummus, aguacate, tomate y espinaca en pan integral tostado.",
    category: "sandwich",
    price: 2.2,
    stock: 3,
    emoji: "🥬",
    reservable: true,
    tags: ["Vegetariano"],
  },
  {
    id: "emp-carne",
    name: "Empanada de Carne",
    desc: "Masa horneada, carne sazonada con cebolla y comino.",
    category: "empanada",
    price: 1.2,
    stock: 22,
    emoji: "🥟",
    reservable: true,
    tags: ["Clásica"],
  },
  {
    id: "emp-queso",
    name: "Empanada de Queso",
    desc: "Queso maduro derretido en masa tradicional crocante.",
    category: "empanada",
    price: 1.0,
    stock: 18,
    emoji: "🧀",
    reservable: true,
    tags: ["Vegetariano"],
  },
  {
    id: "emp-verde",
    name: "Empanada de Verde",
    desc: "Plátano verde relleno de carne, preparada estilo costa.",
    category: "empanada",
    price: 1.1,
    stock: 0,
    emoji: "🫓",
    reservable: true,
    tags: ["Costeña"],
  },
  {
    id: "jugo-naranja",
    name: "Jugo Natural de Naranja",
    desc: "Naranjas exprimidas al momento, sin azúcar añadido. 400 ml.",
    category: "bebida",
    price: 1.5,
    stock: 12,
    emoji: "🍊",
    reservable: true,
    tags: ["Natural"],
  },
  {
    id: "agua",
    name: "Agua Mineral 600 ml",
    desc: "Agua purificada fría. Ideal para acompañar tu combo.",
    category: "bebida",
    price: 0.8,
    stock: 30,
    emoji: "💧",
    reservable: true,
    tags: ["Fría"],
  },
  {
    id: "cold-brew",
    name: "Cold Brew Café",
    desc: "Café en frío de 18 horas, suave y con cuerpo. 350 ml.",
    category: "bebida",
    price: 2.0,
    stock: 6,
    emoji: "🧊",
    reservable: true,
    tags: ["Cafeína"],
  },
  {
    id: "galleta",
    name: "Galleta de Avena",
    desc: "Horneada en casa con avena, miel y pepitas de chocolate.",
    category: "snack",
    price: 0.7,
    stock: 25,
    emoji: "🍪",
    reservable: true,
    tags: ["Snack"],
  },
];

/* ---------- Extras / Compra Rápida (sin reserva) ---------- */
export const EXTRAS = [
  {
    id: "extra-manzana",
    name: "Manzana Roja",
    desc: "Fruta fresca lavada y lista para llevar.",
    category: "extra",
    price: 0.6,
    stock: 20,
    emoji: "🍎",
    reservable: false,
    tags: ["Saludable"],
  },
  {
    id: "extra-barra",
    name: "Barra de Granola",
    desc: "Avena, miel y frutos secos. Energía entre clases.",
    category: "extra",
    price: 0.9,
    stock: 15,
    emoji: "🍫",
    reservable: false,
    tags: ["Energía"],
  },
  {
    id: "extra-yogurt",
    name: "Yogurt Natural",
    desc: "Yogurt cremoso con granola aparte. 180 g.",
    category: "extra",
    price: 1.1,
    stock: 9,
    emoji: "🥛",
    reservable: false,
    tags: ["Proteína"],
  },
  {
    id: "extra-gomas",
    name: "Galletas de Chocolate",
    desc: "Pack de 3 galletas horneadas el mismo día.",
    category: "extra",
    price: 1.0,
    stock: 4,
    emoji: "🍪",
    reservable: false,
    tags: ["Dulce"],
  },
  {
    id: "extra-vaso",
    name: "Vaso Té Frío de Lichi",
    desc: "Té frío frutal, refrescante. 450 ml.",
    category: "extra",
    price: 1.3,
    stock: 11,
    emoji: "🧋",
    reservable: false,
    tags: ["Frío"],
  },
  {
    id: "extra-papas",
    name: "Papas Fritas Crujientes",
    desc: "Porción individual con sal de mar.",
    category: "extra",
    price: 0.8,
    stock: 0,
    emoji: "🍟",
    reservable: false,
    tags: ["Snack"],
  },
];

/* ---------- Promociones destacadas ---------- */
export const PROMOS = [
  {
    id: "promo-2x1",
    tag: "Hoy only",
    title: "2x1 en Empanadas",
    desc: "Lleva dos empanadas de carne y paga una. Válido hasta las 11:00 AM.",
    code: "POLI2X1",
  },
  {
    id: "promo-combo",
    tag: "Combo estudiante",
    title: "Sándwich + Bebida + Snack",
    desc: "Arma tu combo con 15% de descuento sobre el precio individual.",
    code: "COMBOPOLI",
  },
  {
    id: "promo-cold",
    tag: "Tarde de café",
    title: "-25% en Cold Brew",
    desc: "Todos los días entre 2:00 PM y 5:00 PM al recoger en Biblioteca.",
    code: "COLD25",
  },
];

/* ---------- Fidelidad ---------- */
export const LOYALTY_CONFIG = {
  /* 10 puntos por cada $1.00 gastados */
  pointsPerDollar: 10,
  tierName: "Oro",
};

export const PRIZES = [
  { id: "p1", name: "Bebida gratis", cost: 100, emoji: "🥤" },
  { id: "p2", name: "Empanada gratis", cost: 250, emoji: "🥟" },
  { id: "p3", name: "Combo completo", cost: 500, emoji: "🍽️" },
  { id: "p4", name: "PoliMóvil Tote Bag", cost: 750, emoji: "🛍️" },
];

/* ---------- Catálogo unificado ---------- */
export const CATALOG = [...PRODUCTS, ...EXTRAS];

export const CATEGORIES = [
  { id: "all", label: "Todo", emoji: "✨" },
  { id: "sandwich", label: "Sándwiches", emoji: "🥪" },
  { id: "empanada", label: "Empanadas", emoji: "🥟" },
  { id: "bebida", label: "Bebidas", emoji: "🥤" },
  { id: "snack", label: "Snacks", emoji: "🍪" },
];

/* ---------- Posiciones del carrito en el mapa (coords SVG) ---------- */
export const MAP_NODES = {
  start: { x: 40, y: 190 },
  biblioteca: { x: 110, y: 70 },
  bloque4: { x: 300, y: 60 },
  comedor: { x: 250, y: 175 },
  deportes: { x: 80, y: 195 },
};
