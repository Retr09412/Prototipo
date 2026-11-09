/* ============================================================
   Confirmación — código de retiro, detalle del pedido y puntos
   ============================================================ */

import { icon } from "../icons.js";
import { getState } from "../store.js";
import { money } from "../utils.js";
import { go } from "../app.js";

const METHOD_LABEL = {
  qr: "Código QR",
  card: "Tarjeta terminada en",
  cash: "Efectivo al recoger",
};

export function ConfirmationView(root, ctx) {
  const state = getState();
  const order = state.lastOrder;

  if (!order) {
    root.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${icon("info")}</div>
        <h3>No hay pedidos recientes</h3>
        <p>Cuando confirmes un pago, verás aquí tu código de retiro.</p>
        <a class="btn btn-primary" href="#/home">Ir al inicio</a>
      </div>`;
    return;
  }

  const methodText =
    order.method === "card" && order.cardLast4
      ? `${METHOD_LABEL.card} ${order.cardLast4}`
      : METHOD_LABEL[order.method] || order.method;

  const rapidCount = order.items.filter((i) => i.mode === "rapida").length;

  root.innerHTML = `
    <div class="confirm-wrap">
      <div class="confirm-check">${icon("check", { size: 46 })}</div>
      <h1>¡Pedido confirmado!</h1>
      <p>Tu orden está en preparación. Muestra este código al recoger en el punto indicado.</p>

      <div class="pickup-code">
        <div class="code-label">Código de retiro</div>
        <div class="code-value">${order.code}</div>
      </div>

      <div class="confirm-detail">
        <span class="cd-icon">${icon("mapPin")}</span>
        <span class="cd-text">
          <span class="cd-k">Punto de recogida</span>
          <span class="cd-v">${order.pickupName}</span>
        </span>
      </div>

      <div class="confirm-detail">
        <span class="cd-icon">${icon("clock")}</span>
        <span class="cd-text">
          <span class="cd-k">Horario</span>
          <span class="cd-v">${order.slotLabel}</span>
        </span>
      </div>

      <div class="confirm-detail">
        <span class="cd-icon">${icon("wallet")}</span>
        <span class="cd-text">
          <span class="cd-k">Pago · ${methodText}</span>
          <span class="cd-v">${money(order.total)}</span>
        </span>
      </div>

      <div class="confirm-detail">
        <span class="cd-icon">${icon("cart")}</span>
        <span class="cd-text">
          <span class="cd-k">Tu orden</span>
          <span class="cd-v">
            ${order.items.map((i) => `${i.emoji} ${i.name} ×${i.qty}`).join(" · ")}
          </span>
        </span>
      </div>

      ${
        rapidCount > 0
          ? `<div class="rule-note mt-3" style="text-align:left">
               ${icon("zap")}
               <span>${rapidCount} producto(s) de <strong>Compra Rápida</strong>
               se entregan de inmediato en la ubicación del carrito.</span>
             </div>`
          : ""
      }

      <div class="points-earned mt-4">
        ${icon("star")} +${order.earned} puntos de fidelidad
      </div>

      <div class="confirm-actions">
        <a class="btn btn-secondary btn-lg" href="#/home">
          ${icon("home")} Volver al inicio
        </a>
        <a class="btn btn-primary btn-lg" href="#/profile">
          ${icon("user")} Ver mi fidelidad ${icon("arrowRight")}
        </a>
      </div>
    </div>
  `;
}
