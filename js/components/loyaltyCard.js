/* ============================================================
   LoyaltyCard — puntos, progreso hacia premios y canje
   ============================================================ */

import { icon } from "../icons.js";
import { PRIZES, LOYALTY_CONFIG } from "../data.js";
import { getState, prizeProgress, redeemPrize } from "../store.js";
import { toast } from "../app.js";

export function loyaltyCardHTML() {
  const { pts, next, pct, toNext, base, target } = prizeProgress();
  const unlocked = PRIZES.filter((p) => pts >= p.cost);

  return `
    <div class="loyalty-card">
      <div class="loyalty-head">
        <span class="lc-title">${icon("star", { size: 13 })} Programa de fidelidad</span>
        <span class="badge badge-warning">${icon("trophy", { size: 12 })} Nivel ${LOYALTY_CONFIG.tierName}</span>
      </div>

      <div class="loyalty-points">
        <span class="pts-num">${pts}</span>
        <span class="pts-label">puntos acumulados</span>
      </div>

      <div class="loyalty-progress-meta">
        <span>
          ${
            next
              ? `Faltan <strong>${toNext} pts</strong> para <strong>${next.name}</strong>`
              : "¡Desbloqueaste todos los premios! 🎉"
          }
        </span>
        <strong>${pct}%</strong>
      </div>
      <div class="progress" role="progressbar"
           aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"
           aria-label="Progreso al siguiente premio">
        <div class="progress-bar" style="width:${pct}%"></div>
      </div>
      <div class="loyalty-progress-meta mt-2" style="font-size:var(--fs-xs)">
        <span class="text-tertiary">${base} pts</span>
        <span class="text-tertiary">${target} pts</span>
      </div>

      <p class="mt-3" style="font-size:var(--fs-sm);color:var(--text-secondary);position:relative">
        Ganas <strong style="color:var(--text)">${LOYALTY_CONFIG.pointsPerDollar} pts</strong>
        por cada $1.00 en compras confirmadas.
      </p>

      <div class="prize-list">
        ${PRIZES.map((p) => {
          const canRedeem = pts >= p.cost && !getState().redeemed.includes(p.id);
          const already = getState().redeemed.includes(p.id);
          return `
            <div class="prize-item ${canRedeem ? "is-unlocked" : ""}">
              <span class="prize-icon">${already ? icon("check") : icon("gift")}</span>
              <span class="prize-info">
                <strong>${p.emoji} ${p.name}</strong>
                <span>${p.cost} puntos ${already ? "· canjeado" : ""}</span>
              </span>
              ${
                already
                  ? `<span class="badge badge-success">Canjeado</span>`
                  : canRedeem
                    ? `<button class="btn btn-primary btn-sm" type="button" data-redeem="${p.id}">Canjear</button>`
                    : `<span class="badge badge-neutral">${p.cost - pts} pts más</span>`
              }
            </div>`;
        }).join("")}
      </div>
    </div>`;
}

export function bindLoyalty(scope) {
  scope.querySelectorAll("[data-redeem]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const res = redeemPrize(btn.dataset.redeem);
      toast(res.msg, res.ok ? "success" : "error");
      if (res.ok) {
        // re-render de la tarjeta en su contenedor
        const card = scope.querySelector(".loyalty-card");
        if (card) {
          const tmp = document.createElement("div");
          tmp.innerHTML = loyaltyCardHTML();
          card.replaceWith(tmp.firstElementChild);
          bindLoyalty(scope);
        }
      }
    });
  });
}
