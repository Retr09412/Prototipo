/* ============================================================
   Perfil — datos del usuario, fidelidad y órdenes
   ============================================================ */

import { icon } from "../icons.js";
import { getState, subscribe, resetAll } from "../store.js";
import { money, formatFullDate } from "../utils.js";
import { PROMOS } from "../data.js";
import { toast, go } from "../app.js";
import { loyaltyCardHTML, bindLoyalty } from "./loyaltyCard.js";

const METHOD_LABEL = { qr: "QR", card: "Tarjeta", cash: "Efectivo" };

function promoHTML(promo) {
  return `
    <article class="promo-card">
      <span class="promo-tag badge badge-accent">${icon("flame", { size: 13 })} ${promo.tag}</span>
      <h3>${promo.title}</h3>
      <p>${promo.desc}</p>
      <span class="promo-code">${promo.code}</span>
    </article>`;
}

export function ProfileView(root, ctx) {
  function render() {
    const state = getState();
    const user = state.user;
    const orders = state.orders;

    const spent = orders.reduce((a, o) => a + o.total, 0);

    root.innerHTML = `
      <section class="view-head">
        <span class="eyebrow">${icon("user", { size: 14 })} Mi cuenta</span>
        <h1>Hola, ${user.shortName}</h1>
      </section>

      <div class="profile-head">
        <div class="profile-avatar" aria-hidden="true">${user.initials}</div>
        <div class="p-info">
          <h1>${user.name}</h1>
          <p>${user.career}</p>
          <div class="p-id">C.I. ${user.id} · ${user.email}</div>
        </div>
      </div>

      <div class="stat-row">
        <div class="stat-box">
          <div class="stat-num text-warning">${user.points}</div>
          <div class="stat-label">Puntos</div>
        </div>
        <div class="stat-box">
          <div class="stat-num">${orders.length}</div>
          <div class="stat-label">Pedidos</div>
        </div>
        <div class="stat-box">
          <div class="stat-num">${money(spent)}</div>
          <div class="stat-label">Gastado</div>
        </div>
      </div>

      <div class="profile-cols">
        <section class="section">
          <div class="section-head">
            <h2 class="section-title">${icon("star", { size: 18 })} Fidelidad</h2>
          </div>
          <div data-loyalty>${loyaltyCardHTML()}</div>
        </section>

        <section class="section">
          <div class="section-head">
            <h2 class="section-title">${icon("ticket", { size: 18 })} Historial de pedidos</h2>
          </div>

          ${
            orders.length
              ? `<div class="card">
                   ${orders
                     .map(
                       (o) => `
                     <div class="order-item">
                       <span class="o-icon">${icon("check")}</span>
                       <span class="o-info">
                         <strong>${o.code} · ${money(o.total)}</strong>
                         <span>${o.items.length} art. · ${METHOD_LABEL[o.method] || o.method}
                           · ${o.pickupName}</span>
                         <span>${formatFullDate(new Date(o.dateISO))} · +${o.earned} pts</span>
                       </span>
                     </div>`
                     )
                     .join("")}
                 </div>`
              : `<div class="empty-state">
                   <div class="empty-icon">${icon("ticket")}</div>
                   <h3>Aún no tienes pedidos</h3>
                   <p>Tu primer compra aparecerá aquí con su código de retiro.</p>
                    <a class="btn btn-primary" href="#/home">Explorar menú ${icon("arrowRight")}</a>
                 </div>`
          }
        </section>
      </div>

      <section class="section">
        <div class="section-head">
          <h2 class="section-title">${icon("flame", { size: 18 })} Promociones</h2>
        </div>
        <div class="promo-scroll">
          ${PROMOS.map(promoHTML).join("")}
        </div>
      </section>

      <section class="section">
        <button class="btn btn-danger-ghost btn-block" type="button" data-reset>
          ${icon("refresh")} Reiniciar datos del prototipo
        </button>
        <p class="center mt-2" style="font-size:var(--fs-xs);color:var(--text-tertiary)">
          Borra carrito, stock, puntos y órdenes guardados en este navegador.
        </p>
      </section>
    `;

    bind();
  }

  function bind() {
    bindLoyalty(root);

    root.querySelector("[data-reset]")?.addEventListener("click", () => {
      if (!confirm("¿Reiniciar todo el prototipo? Se perderán carrito, puntos y órdenes.")) {
        return;
      }
      resetAll();
      toast("Prototipo reiniciado", "info");
      go("#/home");
    });
  }

  render();

  const off = subscribe(() => {
    if (document.contains(root)) render();
  });
  ctx?.onCleanup?.(off);
}
