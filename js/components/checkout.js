/* ============================================================
   Checkout — resumen + métodos de pago (QR / tarjeta / efectivo)
   ============================================================ */

import { icon } from "../icons.js";
import {
  getState, cartLines, cartSubtotal, cartCount, cartHasReservable,
  setMethod, getPickup, getSlotDate, confirmOrder, pointsFor, stockOf, subscribe,
} from "../store.js";
import { money, formatFullDate, stockInfo } from "../utils.js";
import { go, toast } from "../app.js";

const METHODS = [
  {
    id: "qr",
    name: "Código QR",
    desc: "Escanea con tu app bancaria al momento de pagar",
    icon: "qr",
  },
  {
    id: "card",
    name: "Tarjeta de crédito / débito",
    desc: "Visa, Mastercard o tarjeta prepago",
    icon: "card",
  },
  {
    id: "cash",
    name: "Efectivo al recoger",
    desc: "Pagas en el punto de entrega, sin filas",
    icon: "cash",
  },
];

/* QR determinista generado a partir de un seed (sin dependencias) */
function qrSVG(seedStr) {
  const N = 25;
  let seed = 0;
  for (let i = 0; i < seedStr.length; i++) {
    seed = (seed * 31 + seedStr.charCodeAt(i)) >>> 0;
  }
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };

  const isFinder = (x, y) =>
    (x < 7 && y < 7) || (x >= N - 7 && y < 7) || (x < 7 && y >= N - 7);

  let cells = "";
  for (let y = 0; y < N; y++) {
    for (let x = 0; x < N; x++) {
      if (isFinder(x, y)) continue;
      if (rnd() > 0.52) {
        cells += `<rect x="${x}" y="${y}" width="1" height="1"/>`;
      }
    }
  }

  const finder = (fx, fy) => `
    <rect x="${fx}" y="${fy}" width="7" height="7"/>
    <rect x="${fx + 1}" y="${fy + 1}" width="5" height="5" fill="#fff"/>
    <rect x="${fx + 2}" y="${fy + 2}" width="3" height="3"/>`;

  return `
    <svg viewBox="0 0 ${N} ${N}" shape-rendering="crispEdges" role="img"
         aria-label="Código QR de pago">
      <rect width="${N}" height="${N}" fill="#fff"/>
      <g fill="#000">${cells}${finder(0, 0)}${finder(N - 7, 0)}${finder(0, N - 7)}</g>
    </svg>`;
}

function summaryHTML() {
  const lines = cartLines();
  const pickup = getPickup();
  const slot = getSlotDate();
  const total = cartSubtotal();

  const needsReserve = cartHasReservable();

  return `
    <div class="card">
      <div class="section-head" style="margin-bottom:var(--sp-2)">
        <h2 class="section-title" style="font-size:var(--fs-md)">Resumen de la orden</h2>
        <span class="badge badge-neutral">${cartCount()} art.</span>
      </div>

      ${lines
        .map((l) => {
          const info = stockInfo(stockOf(l.id));
          return `
        <div class="summary-item">
          <span class="s-emoji">${l.emoji}</span>
          <span class="s-info">
            <strong>${l.name}</strong>
            <span>${money(l.price)} c/u · ${
              l.reservable
                ? '<span class="text-accent">Reservable</span>'
                : '<span style="color:var(--info)">Compra rápida</span>'
            }</span>
            <span class="stock-badge ${info.cls}" style="padding:2px 7px;margin-top:4px">
              <i class="stock-dot"></i>${info.label}
            </span>
          </span>
          <span class="s-qty">×${l.qty}</span>
          <span class="s-price">${money(l.lineTotal)}</span>
        </div>`;
        })
        .join("")}

      <div class="divider"></div>

      <div class="kv-row">
        <span class="k">Subtotal</span>
        <span class="v">${money(total)}</span>
      </div>
      <div class="kv-row">
        <span class="k">Descuentos</span>
        <span class="v text-success">−$0.00</span>
      </div>
      <div class="kv-row total">
        <span class="k">Total a pagar</span>
        <span class="v">${money(total)}</span>
      </div>
      <div class="kv-row">
        <span class="k">${icon("star", { size: 14 })} Ganarás</span>
        <span class="v text-warning">+${pointsFor(total)} pts</span>
      </div>

      <div class="divider"></div>

      <div class="kv-row">
        <span class="k">${icon("mapPin", { size: 14 })} Recogida</span>
        <span class="v" style="text-align:right;max-width:62%">
          ${
            pickup
              ? pickup.name
              : '<span class="text-danger">Falta punto de retiro</span>'
          }
        </span>
      </div>
      <div class="kv-row">
        <span class="k">${icon("clock", { size: 14 })} Horario</span>
        <span class="v" style="text-align:right;max-width:62%">
          ${
            needsReserve
              ? slot
                ? formatFullDate(slot)
                : '<span class="text-danger">Falta horario</span>'
              : "Inmediato (compra rápida)"
          }
        </span>
      </div>
    </div>`;
}

function paymentPanelHTML(method, seed) {
  if (method === "qr") {
    return `
      <div class="pay-panel">
        <div class="qr-box">
          <div class="qr-frame">${qrSVG(seed)}</div>
          <p class="qr-hint">
            Escanea este código con tu app de pagos para transferir
            <strong>${money(cartSubtotal())}</strong>. Se verifica automáticamente
            al confirmar.
          </p>
        </div>
      </div>`;
  }

  if (method === "card") {
    return `
      <div class="pay-panel">
        <form class="card-form" data-card-form novalidate>
          <div class="field">
            <label class="field-label" for="ccNumber">Número de tarjeta</label>
            <div class="input-wrap">
              ${icon("card")}
              <input class="input" id="ccNumber" name="number" inputmode="numeric"
                     autocomplete="cc-number" placeholder="4111 1111 1111 1111" maxlength="19" />
            </div>
            <span class="field-error">Ingresa los 16 dígitos de la tarjeta</span>
          </div>
          <div class="row-2">
            <div class="field">
              <label class="field-label" for="ccExp">Vencimiento</label>
              <input class="input" id="ccExp" name="exp" inputmode="numeric"
                     autocomplete="cc-exp" placeholder="MM/AA" maxlength="5" />
              <span class="field-error">Formato MM/AA</span>
            </div>
            <div class="field">
              <label class="field-label" for="ccCvc">CVC</label>
              <input class="input" id="ccCvc" name="cvc" inputmode="numeric"
                     autocomplete="cc-csc" placeholder="123" maxlength="4" />
              <span class="field-error">3 dígitos</span>
            </div>
          </div>
          <div class="field" style="margin-bottom:0">
            <label class="field-label" for="ccName">Nombre en la tarjeta</label>
            <input class="input" id="ccName" name="name" autocomplete="cc-name"
                   placeholder="NICOLA HERRERA" />
            <span class="field-error">Ingresa el nombre del titular</span>
          </div>
        </form>
      </div>`;
  }

  return `
    <div class="pay-panel">
      <div class="cash-note">
        ${icon("checkCircle")}
        <span>
          Pagarás <strong>${money(cartSubtotal())}</strong> en efectivo cuando recojas
          tu pedido en el punto elegido. Ten el monto exacto listo para agilizar la entrega.
        </span>
      </div>
    </div>`;
}

export function CheckoutView(root, ctx) {
  const state = getState();
  const seed = `PMX-${state.user.id}-${Date.now()}`;

  function render() {
    const s = getState();
    if (cartCount() === 0) return; // el router ya redirige

    root.innerHTML = `
      <section class="view-head">
        <span class="eyebrow">${icon("wallet", { size: 14 })} Paso 3 de 3</span>
        <h1>Confirma y paga</h1>
        <p>Revisa tu orden, elige el método de pago y confirma la reserva.</p>
      </section>

      <div class="steps" aria-label="Progreso de compra">
        <div class="step is-done"><span class="step-num">${icon("check", { size: 13 })}</span> Carrito</div>
        <div class="step-line"></div>
        <div class="step is-done"><span class="step-num">${icon("check", { size: 13 })}</span> Reserva</div>
        <div class="step-line"></div>
        <div class="step is-active"><span class="step-num">3</span> Pago</div>
      </div>

      <div class="checkout-layout">
        <div class="co-main">
          <section class="section">
            <div class="section-head">
              <h2 class="section-title">Método de pago</h2>
            </div>
            <div class="pay-stack" role="radiogroup" aria-label="Métodos de pago">
              ${METHODS.map(
                (m) => `
                <button class="pay-option" type="button" role="radio"
                  aria-checked="${s.method === m.id}" data-method="${m.id}">
                  <span class="pay-icon">${icon(m.icon)}</span>
                  <span>
                    <span class="pay-name">${m.name}</span>
                    <span class="pay-desc">${m.desc}</span>
                  </span>
                  <span class="radio-mark"></span>
                </button>`
              ).join("")}
            </div>
            <div data-panel>${paymentPanelHTML(s.method, seed)}</div>
          </section>
        </div>

        <aside class="co-side">
          ${summaryHTML()}
          <button class="btn btn-primary btn-lg btn-block mt-4 side-cta" type="button" data-pay>
            ${icon("checkCircle")} Pagar ${money(cartSubtotal())}
          </button>
          <a class="btn btn-ghost btn-block mt-3 side-cta" href="#/reserve">
            ${icon("chevronLeft")} Volver a elegir retiro
          </a>
        </aside>
      </div>

      <div class="sticky-cta">
        <div class="sticky-info">
          <span class="sticky-total">${money(cartSubtotal())}</span>
          <span class="sticky-sub">${
            getState().method === "qr"
              ? "Paga escaneando el código QR"
              : getState().method === "card"
                ? "Tarjeta terminada en ••••"
                : "Efectivo al recoger"
          }</span>
        </div>
        <button class="btn btn-primary" type="button" data-pay>
          Pagar ${icon("checkCircle", { size: 17 })}
        </button>
      </div>
      <div class="sticky-spacer"></div>
    `;

    bind();
  }

  function bind() {
    root.querySelectorAll("[data-method]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setMethod(btn.dataset.method); // emite → re-render vía subscribe
      });
    });

    bindCardForm();

    root.querySelectorAll("[data-pay]").forEach((btn) => {
      btn.addEventListener("click", pay);
    });
  }

  function bindCardForm() {
    const form = root.querySelector("[data-card-form]");
    if (!form) return;

    const number = form.querySelector("#ccNumber");
    const exp = form.querySelector("#ccExp");
    const cvc = form.querySelector("#ccCvc");

    number.addEventListener("input", () => {
      const digits = number.value.replace(/\D/g, "").slice(0, 16);
      number.value = digits.replace(/(.{4})/g, "$1 ").trim();
    });

    exp.addEventListener("input", () => {
      let v = exp.value.replace(/\D/g, "").slice(0, 4);
      if (v.length >= 3) v = `${v.slice(0, 2)}/${v.slice(2)}`;
      exp.value = v;
    });

    cvc.addEventListener("input", () => {
      cvc.value = cvc.value.replace(/\D/g, "").slice(0, 4);
    });
  }

  function validateCard() {
    const form = root.querySelector("[data-card-form]");
    if (!form) return { ok: true };

    const checks = [
      ["#ccNumber", (v) => v.replace(/\D/g, "").length === 16],
      ["#ccExp", (v) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(v)],
      ["#ccCvc", (v) => /^\d{3,4}$/.test(v)],
      ["#ccName", (v) => v.trim().length >= 3],
    ];

    let ok = true;
    checks.forEach(([sel, test]) => {
      const input = form.querySelector(sel);
      const field = input.closest(".field");
      const valid = test(input.value);
      field.classList.toggle("has-error", !valid);
      input.classList.toggle("is-invalid", !valid);
      if (!valid) ok = false;
    });
    return ok;
  }

  function pay() {
    const s = getState();

    // Punto de retiro siempre; horario solo si hay reservables
    if (!s.pickupId) {
      toast("Falta el punto de recogida", "error");
      go("#/reserve");
      return;
    }
    if (cartHasReservable() && !s.slotISO) {
      toast("Falta el horario de recogida", "error");
      go("#/reserve");
      return;
    }

    if (s.method === "card" && !validateCard()) {
      toast("Revisa los datos de la tarjeta", "error");
      root.querySelector(".is-invalid")?.focus();
      return;
    }

    const payBtns = [...root.querySelectorAll("[data-pay]")];
    const originals = payBtns.map((b) => b.innerHTML);
    payBtns.forEach((b) => {
      b.disabled = true;
      b.textContent = "Procesando…";
    });

    const cardInfo =
      s.method === "card"
        ? { last4: (root.querySelector("#ccNumber")?.value || "").replace(/\D/g, "").slice(-4) }
        : null;

    setTimeout(() => {
      const result = confirmOrder({ cardInfo });
      if (!result.ok) {
        payBtns.forEach((b, i) => {
          b.disabled = false;
          b.innerHTML = originals[i];
        });
        toast(result.msg, "error");
        return;
      }
      toast("¡Pago aprobado!");
      go("#/confirmation");
    }, 700);
  }

  render();

  const off = subscribe(() => {
    if (document.contains(root)) render();
  });
  ctx?.onCleanup?.(off);
}
