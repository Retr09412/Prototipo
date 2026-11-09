/* ============================================================
   CartDrawer — panel lateral (desktop) / sheet (móvil)
   ============================================================ */

import { icon } from "../icons.js";
import {
  cartLines, cartSubtotal, cartCount, cartHasReservable,
  setQty, clearCart, stockOf,
} from "../store.js";
import { money, stockInfo } from "../utils.js";
import { go, toast } from "../app.js";

let isOpen = false;
let lastFocus = null;

function lineHTML(line) {
  const stock = stockOf(line.id);
  const info = stockInfo(stock);
  const atMax = line.qty >= stock;
  const modeBadge = line.reservable
    ? `<span class="badge badge-accent">Reservable</span>`
    : `<span class="badge badge-info">Compra rápida</span>`;

  return `
    <div class="cart-line" data-line="${line.id}">
      <div class="cl-emoji" aria-hidden="true">${line.emoji}</div>
      <div class="cl-info">
        <strong>${line.name}</strong>
        <div class="cl-meta">
          ${modeBadge}
          <span>${money(line.price)} c/u</span>
          <span class="stock-badge ${info.cls}" style="padding:2px 7px">
            <i class="stock-dot"></i>${info.label}
          </span>
        </div>
        <div class="cl-bottom">
          <div class="stepper" role="group" aria-label="Cantidad de ${line.name}">
            <button type="button" data-dec="${line.id}" aria-label="Quitar uno">${icon("minus", { size: 16 })}</button>
            <span class="qty">${line.qty}</span>
            <button type="button" data-inc="${line.id}" aria-label="Agregar uno"
              ${atMax ? "disabled" : ""}>${icon("plus", { size: 16 })}</button>
          </div>
          <span class="cl-price">${money(line.lineTotal)}</span>
        </div>
      </div>
    </div>`;
}

function bodyHTML() {
  const lines = cartLines();

  if (!lines.length) {
    return `
      <div class="empty-state">
        <div class="empty-icon">${icon("cart")}</div>
        <h3>Tu carrito está vacío</h3>
        <p>Agrega productos del menú para armar tu pedido.</p>
        <a class="btn btn-primary" href="#/home" data-close-cart>
          Ver menú ${icon("arrowRight")}
        </a>
      </div>`;
  }

  const reservable = lines.filter((l) => l.reservable);
  const rapid = lines.filter((l) => !l.reservable);

  const note = reservable.length && rapid.length
    ? `<div class="rule-note mt-3">
         ${icon("info")}
         <span>Tienes productos <strong>reservables</strong> y de <strong>compra rápida</strong>.
         Elige punto y horario para los reservables; los extras se retiran de inmediato en ese punto.</span>
       </div>`
    : "";

  return `
    ${note}
    <div class="mt-2">${lines.map(lineHTML).join("")}</div>
    <div class="divider"></div>
    <div class="kv-row">
      <span class="k">Subtotal (${cartCount()} art.)</span>
      <span class="v">${money(cartSubtotal())}</span>
    </div>
    <div class="kv-row">
      <span class="k">Descuentos</span>
      <span class="v text-success">−$0.00</span>
    </div>
    <div class="kv-row total">
      <span class="k">Total</span>
      <span class="v">${money(cartSubtotal())}</span>
    </div>
    ${
      reservable.length
        ? ""
        : `<div class="rule-note mt-3">
             ${icon("zap")}
             <span>Solo tienes <strong>compra rápida</strong>: elige el punto de
             retiro (sin horario) y revisa el <strong>stock</strong> antes de pagar.</span>
           </div>`
    }
  `;
}

function footHTML() {
  const lines = cartLines();
  if (!lines.length) return "";

  const needsReserve = cartHasReservable();
  const ctaLabel = needsReserve ? "Continuar a reserva" : "Elegir punto de retiro";

  return `
    <button class="btn btn-primary btn-lg btn-block" type="button" data-cart-cta>
      ${icon("calendar")}
      ${ctaLabel}
      <span style="margin-left:auto;font-variant-numeric:tabular-nums">${money(cartSubtotal())}</span>
    </button>
    <button class="btn btn-danger-ghost btn-block mt-3" type="button" data-cart-clear
            style="min-height:42px">
      Vaciar carrito
    </button>`;
}

function render() {
  const drawer = document.getElementById("cartDrawer");
  if (!drawer || !isOpen) return;

  drawer.innerHTML = `
    <div class="drawer-handle" aria-hidden="true"></div>
    <div class="drawer-head">
      <h2>Tu carrito</h2>
      <button class="btn-icon" type="button" data-cart-close aria-label="Cerrar carrito">
        ${icon("x")}
      </button>
    </div>
    <div class="drawer-body">${bodyHTML()}</div>
    <div class="drawer-foot">${footHTML()}</div>
  `;
  bind(drawer);
}

function bind(scope) {
  scope.querySelectorAll("[data-inc]").forEach((b) =>
    b.addEventListener("click", () => {
      const id = b.dataset.inc;
      const line = cartLines().find((l) => l.id === id);
      if (!line) return;
      if (setQty(id, line.qty + 1) !== false && line.qty + 1 > stockOf(id)) {
        toast("No hay más stock de ese producto", "error");
      }
    })
  );

  scope.querySelectorAll("[data-dec]").forEach((b) =>
    b.addEventListener("click", () => {
      const id = b.dataset.dec;
      const line = cartLines().find((l) => l.id === id);
      if (line) setQty(id, line.qty - 1);
    })
  );

  scope.querySelectorAll("[data-cart-close]").forEach((b) =>
    b.addEventListener("click", closeCart)
  );
  scope.querySelectorAll("[data-close-cart]").forEach((b) =>
    b.addEventListener("click", () => setTimeout(closeCart, 10))
  );

  const cta = scope.querySelector("[data-cart-cta]");
  if (cta) {
    cta.addEventListener("click", () => {
      closeCart();
      // Siempre pasar por reserve: allí se elige el punto de retiro
      go("#/reserve");
    });
  }

  const clearBtn = scope.querySelector("[data-cart-clear]");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      clearCart();
      toast("Carrito vaciado", "info");
      render();
    });
  }
}

export function openCart() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("overlay");
  if (!drawer || !overlay) return;

  lastFocus = document.activeElement;
  isOpen = true;
  overlay.hidden = false;
  drawer.hidden = false;
  document.body.style.overflow = "hidden";
  render();

  overlay.onclick = closeCart;
  requestAnimationFrame(() => drawer.querySelector("[data-cart-close]")?.focus());
}

export function closeCart() {
  const drawer = document.getElementById("cartDrawer");
  const overlay = document.getElementById("overlay");
  if (!drawer || !overlay) return;

  isOpen = false;
  overlay.hidden = true;
  drawer.hidden = true;
  document.body.style.overflow = "";
  if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
}

export function isCartOpen() {
  return isOpen;
}

/** Re-render en vivo cuando cambia el store con el panel abierto. */
export function refreshCart() {
  if (isOpen) render();
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && isOpen) closeCart();
});
