/* ============================================================
   Store — estado global + persistencia (localStorage)
   ============================================================ */

import { CATALOG, USER, LOYALTY_CONFIG, PICKUP_POINTS, PRIZES as PRIZE_LIST } from "./data.js";
import { generateOrderCode, money } from "./utils.js";

const STORAGE_KEY = "polimovil-express:v1";

function initialState() {
  const stock = {};
  CATALOG.forEach((item) => (stock[item.id] = item.stock));
  return {
    cart: {},            // { [productId]: { qty, mode: 'reserva'|'rapida' } }
    stock,
    pickupId: null,
    slotISO: null,
    method: "qr",
    user: { ...USER },
    orders: [],
    lastOrder: null,
    redeemed: [],
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialState();
    const saved = JSON.parse(raw);
    const base = initialState();
    const merged = {
      ...base,
      ...saved,
      user: { ...base.user, ...(saved.user || {}) },
      stock: { ...base.stock, ...(saved.stock || {}) },
      cart: saved.cart && typeof saved.cart === "object" ? saved.cart : {},
      orders: Array.isArray(saved.orders) ? saved.orders : [],
      redeemed: Array.isArray(saved.redeemed) ? saved.redeemed : [],
    };
    return merged;
  } catch {
    return initialState();
  }
}

let state = load();
const listeners = new Set();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* modo privado / cuota llena: el prototipo sigue en memoria */
  }
}

function emit() {
  persist();
  listeners.forEach((fn) => {
    try {
      fn(state);
    } catch (e) {
      console.error("[store] listener error", e);
    }
  });
}

export function getState() {
  return state;
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* ---------- Carrito ---------- */
export function cartLines() {
  return Object.entries(state.cart)
    .map(([id, line]) => {
      const item = CATALOG.find((c) => c.id === id);
      if (!item) return null;
      return { ...item, ...line, id, lineTotal: item.price * line.qty };
    })
    .filter(Boolean);
}

export function cartCount() {
  return Object.values(state.cart).reduce((a, l) => a + l.qty, 0);
}

export function cartSubtotal() {
  return cartLines().reduce((a, l) => a + l.lineTotal, 0);
}

export function cartHasReservable() {
  return cartLines().some((l) => l.reservable);
}

export function cartQty(id) {
  return state.cart[id]?.qty || 0;
}

export function addToCart(id, mode = "reserva") {
  const item = CATALOG.find((c) => c.id === id);
  if (!item) return false;
  const available = state.stock[id] ?? 0;
  const current = state.cart[id]?.qty || 0;
  if (available <= 0 || current >= available) return false;

  const existing = state.cart[id];
  state.cart[id] = {
    qty: current + 1,
    mode: existing ? existing.mode : mode,
  };
  emit();
  return true;
}

export function setQty(id, qty) {
  const available = state.stock[id] ?? 0;
  if (qty <= 0) {
    delete state.cart[id];
  } else {
    state.cart[id] = {
      ...state.cart[id],
      qty: Math.min(qty, available),
      mode: state.cart[id]?.mode || "reserva",
    };
  }
  emit();
}

export function clearCart() {
  state.cart = {};
  state.pickupId = null;
  state.slotISO = null;
  emit();
}

/* ---------- Reserva ---------- */
export function setPickup(id) {
  state.pickupId = id;
  state.slotISO = null; // cambiar de punto invalida el horario elegido
  emit();
}

export function setSlot(iso) {
  state.slotISO = iso;
  emit();
}

export function getPickup() {
  return PICKUP_POINTS.find((p) => p.id === state.pickupId) || null;
}

export function getSlotDate() {
  return state.slotISO ? new Date(state.slotISO) : null;
}

/* ---------- Pago ---------- */
export function setMethod(method) {
  state.method = method;
  emit();
}

/* ---------- Fidelidad ---------- */
export function pointsFor(total) {
  return Math.floor(total * LOYALTY_CONFIG.pointsPerDollar);
}

export function prizeProgress() {
  const pts = state.user.points;
  const next = PRIZE_LIST.find((p) => p.cost > pts) || null;
  const prevCost = next
    ? PRIZE_LIST.filter((p) => p.cost <= pts).slice(-1)[0]?.cost || 0
    : PRIZE_LIST[PRIZE_LIST.length - 1].cost;
  const base = next ? prevCost : 0;
  const target = next ? next.cost : prevCost;
  const pct = next
    ? Math.min(100, Math.round(((pts - base) / (target - base)) * 100))
    : 100;
  return { pts, next, pct, toNext: next ? next.cost - pts : 0, base, target };
}

export function redeemPrize(prizeId) {
  const prize = PRIZE_LIST.find((p) => p.id === prizeId);
  if (!prize) return { ok: false, msg: "Premio no encontrado" };
  if (state.redeemed.includes(prizeId)) return { ok: false, msg: "Ya canjeado" };
  if (state.user.points < prize.cost) {
    return { ok: false, msg: `Necesitas ${prize.cost - state.user.points} pts más` };
  }
  state.user.points -= prize.cost;
  state.redeemed.push(prizeId);
  emit();
  return { ok: true, msg: `¡Canjeaste ${prize.name}!` };
}

/* ---------- Confirmación de orden ---------- */
export function confirmOrder({ cardInfo } = {}) {
  const lines = cartLines();
  if (!lines.length) return { ok: false, msg: "El carrito está vacío" };

  const needsReservation = lines.some((l) => l.reservable);
  // Punto de retiro siempre obligatorio; horario solo si hay reservables
  if (!state.pickupId) {
    return { ok: false, msg: "Falta el punto de recogida" };
  }
  if (needsReservation && !state.slotISO) {
    return { ok: false, msg: "Falta el horario de recogida" };
  }

  const total = cartSubtotal();
  const earned = pointsFor(total);

  // Descuento de stock en tiempo real
  lines.forEach((l) => {
    state.stock[l.id] = Math.max(0, (state.stock[l.id] ?? 0) - l.qty);
  });

  const pickup = getPickup();
  const slot = getSlotDate();

  const order = {
    code: generateOrderCode(),
    dateISO: new Date().toISOString(),
    total,
    earned,
    method: state.method,
    pickupId: state.pickupId,
    pickupName: pickup ? pickup.name : "Punto de retiro",
    slotISO: state.slotISO,
    slotLabel: slot
      ? slot.toLocaleString("es-EC", {
          weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
        })
      : "Inmediato",
    items: lines.map((l) => ({
      id: l.id,
      name: l.name,
      emoji: l.emoji,
      qty: l.qty,
      price: l.price,
      mode: l.mode,
    })),
    cardLast4: cardInfo?.last4 || null,
  };

  state.user.points += earned;
  state.orders.unshift(order);
  state.lastOrder = order;
  state.cart = {};
  state.pickupId = null;
  state.slotISO = null;
  emit();

  return { ok: true, order };
}

/* ---------- Utilidades ---------- */
export function stockOf(id) {
  return state.stock[id] ?? 0;
}

export function resetAll() {
  state = initialState();
  emit();
}

export { money };
