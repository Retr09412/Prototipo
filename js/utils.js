/* ============================================================
   Utils — fechas, dinero, reglas de negocio
   ============================================================ */

import { PICKUP_POINTS } from "./data.js";

export const HOUR_MS = 60 * 60 * 1000;
export const DAY_MS = 24 * HOUR_MS;

export function money(n) {
  return `$${Number(n).toFixed(2)}`;
}

/* Próxima parada + ETA determinista del carrito (cambia cada ~6 min) */
export function cartStatus() {
  const now = new Date();
  const band = Math.floor(now.getHours() * 10 + now.getMinutes() / 6);
  const point = PICKUP_POINTS[band % PICKUP_POINTS.length];
  const eta = new Date(now.getTime() + (8 + (band % 4) * 3) * 60000);
  const hh = String(eta.getHours()).padStart(2, "0");
  const mm = String(Math.floor(eta.getMinutes() / 5) * 5).padStart(2, "0");
  return { point, etaLabel: `${hh}:${mm}` };
}

export function plural(n, one, many) {
  return `${n} ${n === 1 ? one : many}`;
}

/* ---------- Fechas ---------- */
const DAY_NAMES = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
const MONTH_NAMES = [
  "ene", "feb", "mar", "abr", "may", "jun",
  "jul", "ago", "sep", "oct", "nov", "dic",
];

export function pad(n) {
  return String(n).padStart(2, "0");
}

export function formatTime(d) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function formatDayLabel(d, now = new Date()) {
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOf(d) - startOf(now)) / DAY_MS);
  if (diffDays === 0) return "Hoy";
  if (diffDays === 1) return "Mañana";
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`;
}

export function formatFullDate(d) {
  return `${DAY_NAMES[d.getDay()]} ${d.getDate()} ${MONTH_NAMES[d.getMonth()]} · ${formatTime(d)}`;
}

/* ---------- Regla de ventana de reserva ----------
   El usuario puede reservar desde 1 día antes hasta exactamente
   1 hora antes de la entrega programada en el punto seleccionado.
   => Una entrega en T es válida si:  now + 1h <= T <= now + 24h
--------------------------------------------------- */
export function deliveryWindow(now = new Date()) {
  const min = new Date(now.getTime() + HOUR_MS);            // mínimo: 1 hora antes
  const max = new Date(now.getTime() + DAY_MS);             // máximo: 1 día antes
  return { min, max };
}

export function slotStatus(date, now = new Date()) {
  const { min, max } = deliveryWindow(now);
  const t = date.getTime();
  if (t < min.getTime()) {
    return { valid: false, reason: "−1 h", hint: "Reserva mínima 1 hora antes" };
  }
  if (t > max.getTime()) {
    return { valid: false, reason: "+1 d", hint: "Máximo 1 día de anticipación" };
  }
  if (date.getTime() <= now.getTime()) {
    return { valid: false, reason: "Pasado", hint: "Horario ya pasó" };
  }
  return { valid: true, reason: "", hint: "Disponible" };
}

function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/* Genera los slots de un punto agrupados por día (ventana +1d / −1h) */
export function generateSlots(pointId, now = new Date()) {
  const point = PICKUP_POINTS.find((p) => p.id === pointId);
  if (!point) return [];

  const interval = point.slotInterval || 30;
  const groups = [];
  const { min, max } = deliveryWindow(now);

  for (let dayOffset = 0; dayOffset <= 2; dayOffset++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dayOffset);
    const weekday = day.getDay() === 0 ? 7 : day.getDay();
    if (!point.schedule.days.includes(weekday)) continue;

    const openM = timeToMinutes(point.schedule.open);
    const closeM = timeToMinutes(point.schedule.close);
    const slots = [];

    for (let m = openM; m + interval <= closeM; m += interval) {
      const d = new Date(
        day.getFullYear(), day.getMonth(), day.getDate(),
        Math.floor(m / 60), m % 60, 0, 0
      );
      if (d.getTime() < now.getTime()) continue;
      const status = slotStatus(d, now);
      const inWindow = d >= min && d <= max;
      slots.push({
        date: d,
        key: `${point.id}|${d.toISOString()}`,
        label: formatTime(d),
        valid: status.valid,
        hint: status.valid ? "Disponible" : inWindow ? status.hint : status.hint,
        reason: status.reason,
      });
    }

    if (slots.length) {
      groups.push({
        key: `${point.id}-${dayOffset}`,
        label: formatDayLabel(day, now),
        slots,
      });
    }
  }
  return groups;
}

export function countAvailableSlots(groups) {
  return groups.reduce((acc, g) => acc + g.slots.filter((s) => s.valid).length, 0);
}

/* ---------- Stock ---------- */
export function stockInfo(stock) {
  if (stock <= 0) return { cls: "stock-out", label: "Agotado", level: "out" };
  if (stock <= 5) return { cls: "stock-low", label: `Últimos ${stock}`, level: "low" };
  return { cls: "stock-ok", label: `${stock} disponibles`, level: "ok" };
}

/* ---------- Código de pedido ---------- */
export function generateOrderCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 5; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return `PMX-${out}`;
}
