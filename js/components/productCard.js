/* ============================================================
   ProductCard — tarjeta de producto con stock en tiempo real
   ============================================================ */

import { icon } from "../icons.js";
import { money, stockInfo } from "../utils.js";
import { cartQty, addToCart, setQty, stockOf } from "../store.js";
import { CATALOG } from "../data.js";
import { toast } from "../app.js";

export function stockBadgeHTML(id) {
  const info = stockInfo(stockOf(id));
  return `
    <span class="stock-badge ${info.cls}" data-stock-badge="${id}">
      <i class="stock-dot"></i>${info.label}
    </span>`;
}

export function productCardHTML(item) {
  const stock = stockOf(item.id);
  const qty = cartQty(item.id);
  const out = stock <= 0;
  const mode = item.reservable ? "reserva" : "rapida";

  const media = `
    <div class="product-media">
      <div class="media-badges">
        <span class="badge ${
          item.reservable ? "badge-accent" : "badge-info"
        }">${item.reservable ? "Reservable" : "Compra rápida"}</span>
        ${
          item.tags?.[0]
            ? `<span class="badge badge-neutral">${item.tags[0]}</span>`
            : ""
        }
      </div>
      <span aria-hidden="true">${item.emoji}</span>
    </div>`;

  const control = out
    ? `<button class="add-btn" type="button" disabled aria-label="Agotado">${icon("plus", { size: 20 })}</button>`
    : qty > 0
      ? `<div class="stepper" role="group" aria-label="Cantidad de ${item.name}">
           <button type="button" data-dec="${item.id}" aria-label="Quitar uno">${icon("minus", { size: 16 })}</button>
           <span class="qty">${qty}</span>
           <button type="button" data-inc="${item.id}" aria-label="Agregar uno"
             ${qty >= stock ? "disabled" : ""}>${icon("plus", { size: 16 })}</button>
         </div>`
      : `<button class="add-btn" type="button" data-add="${item.id}" data-mode="${mode}"
           aria-label="Agregar ${item.name} al carrito">${icon("plus", { size: 20 })}</button>`;

  return `
    <article class="product-card ${out ? "is-out" : ""}" data-card="${item.id}">
      ${media}
      <div class="product-body">
        <div class="product-badges">
          ${stockBadgeHTML(item.id)}
        </div>
        <h3 class="product-name">${item.name}</h3>
        <p class="product-desc">${item.desc}</p>
        <div class="product-foot">
          <span class="product-price">${money(item.price)}</span>
          ${control}
        </div>
      </div>
    </article>`;
}

/** Delegación de eventos: agregar / stepper. Re-renderiza solo la tarjeta afectada. */
export function bindProductGrid(container, { onChange } = {}) {
  const modeOf = (id) => {
    const item = ITEM_BY_ID(id);
    return item?.reservable ? "reserva" : "rapida";
  };

  container.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-add]");
    const incBtn = e.target.closest("[data-inc]");
    const decBtn = e.target.closest("[data-dec]");

    if (addBtn) {
      const id = addBtn.dataset.add;
      const itemMode = addBtn.dataset.mode || modeOf(id);
      const ok = addToCart(id, itemMode);
      if (!ok) {
        toast("No hay stock disponible", "error");
        return;
      }
      toast("Agregado al carrito");
      refreshCard(container, id);
      onChange?.();
      return;
    }

    if (incBtn) {
      const id = incBtn.dataset.inc;
      if (addToCart(id, modeOf(id))) {
        refreshCard(container, id);
        onChange?.();
      } else {
        toast("No hay más stock de ese producto", "error");
      }
      return;
    }

    if (decBtn) {
      const id = decBtn.dataset.dec;
      setQty(id, cartQty(id) - 1);
      refreshCard(container, id);
      onChange?.();
    }
  });
}

/** Actualiza una tarjeta sin re-renderizar toda la grilla (mantiene scroll/filtros). */
export function refreshCard(container, id) {
  const card = container.querySelector(`[data-card="${id}"]`);
  const item = ITEM_BY_ID(id);
  if (!card || !item) return;

  const tmp = document.createElement("div");
  tmp.innerHTML = productCardHTML(item);
  const fresh = tmp.firstElementChild;
  card.replaceWith(fresh);
}

function ITEM_BY_ID(id) {
  return CATALOG.find((c) => c.id === id);
}

/** Refresca todos los badges de stock de la vista (cuando el store cambia). */
export function refreshStockBadges(container) {
  container.querySelectorAll("[data-stock-badge]").forEach((el) => {
    const id = el.dataset.stockBadge;
    const info = stockInfo(stockOf(id));
    el.className = `stock-badge ${info.cls}`;
    el.innerHTML = `<i class="stock-dot"></i>${info.label}`;
  });
}
