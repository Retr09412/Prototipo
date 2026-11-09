/* ============================================================
   Menú — grilla unificada de productos (reservables + compra
   rápida) con buscador y chips de filtro. Es la página principal.
   ============================================================ */

import { icon } from "../icons.js";
import { CATALOG, CATEGORIES } from "../data.js";
import { subscribe, cartCount } from "../store.js";
import { cartStatus } from "../utils.js";
import { productCardHTML, bindProductGrid, refreshStockBadges } from "./productCard.js";

/* Chips: tipo (todo/reservable/rapida) + categorías */
const TYPE_CHIPS = [
  { id: "all", label: "Todo", emoji: "✨" },
  { id: "reservable", label: "Reservable", emoji: "🗓️" },
  { id: "rapida", label: "Compra rápida", emoji: "⚡" },
];

export function CatalogView(root, ctx) {
  let activeFilter = "all";
  let query = "";

  function matchesFilter(p) {
    if (activeFilter === "all") return true;
    if (activeFilter === "reservable") return !!p.reservable;
    if (activeFilter === "rapida") return !p.reservable;
    return p.category === activeFilter;
  }

  function filtered() {
    return CATALOG.filter((p) => {
      const q = query.trim().toLowerCase();
      const qOk =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        (p.tags || []).some((t) => t.toLowerCase().includes(q));
      return matchesFilter(p) && qOk;
    });
  }

  function gridHTML() {
    const items = filtered();
    if (!items.length) {
      return `
        <div class="empty-state">
          <div class="empty-icon">${icon("search")}</div>
          <h3>Sin resultados</h3>
          <p>No encontramos productos con “${query || activeFilter}”. Prueba otra búsqueda o filtro.</p>
        </div>`;
    }
    return `<div class="product-grid" data-grid>${items
      .map((p) => productCardHTML(p))
      .join("")}</div>`;
  }

  function chipsHTML() {
    const typeBtns = TYPE_CHIPS.map(
      (c) => `
      <button class="chip" type="button" data-filter="${c.id}"
        aria-pressed="${c.id === activeFilter}">
        <span aria-hidden="true">${c.emoji}</span> ${c.label}
      </button>`
    ).join("");
    const catBtns = CATEGORIES.filter((c) => c.id !== "all")
      .map(
        (c) => `
      <button class="chip" type="button" data-filter="${c.id}"
        aria-pressed="${c.id === activeFilter}">
        <span aria-hidden="true">${c.emoji}</span> ${c.label}
      </button>`
      )
      .join("");
    const extraBtn = `
      <button class="chip" type="button" data-filter="extra"
        aria-pressed="${activeFilter === "extra"}">
        <span aria-hidden="true">🍎</span> Extras
      </button>`;
    return typeBtns + catBtns + extraBtn;
  }

  function liveStripHTML() {
    if (cartCount() === 0) return "";
    const { point, etaLabel } = cartStatus();
    return `
      <div class="live-strip" data-live-strip>
        <span class="live-pill"><i class="live-dot"></i> En vivo</span>
        <span class="ls-text">
          Próxima parada: <strong>${point.name}</strong>
          <span class="ls-eta">${etaLabel}</span>
        </span>
      </div>`;
  }

  root.innerHTML = `
    <section class="view-head">
      <span class="eyebrow">${icon("zap", { size: 14 })} Pedido rápido</span>
      <h1>Pide en segundos</h1>
      <p>Elige tus productos, arma el carrito y recoge sin filas. Stock en tiempo real.</p>
    </section>

    <div class="search-wrap">
      <div class="input-wrap">
        ${icon("search")}
        <input class="input" type="search" placeholder="Buscar sándwich, empanada, bebida…"
               aria-label="Buscar productos" data-search />
      </div>
    </div>

    <div data-strip-slot>${liveStripHTML()}</div>

    <div class="chip-row mb-4" role="group" aria-label="Filtrar productos" data-chips>
      ${chipsHTML()}
    </div>

    <div data-grid-slot>${gridHTML()}</div>

    <div class="rule-note mt-6">
      ${icon("info")}
      <span><strong>Reservable</strong>: elige punto y horario de recogida (1 día antes ↔ 1 hora antes).
      <strong>Compra rápida</strong>: se entrega de inmediato en el carrito, sin reserva.</span>
    </div>
  `;

  const gridSlot = root.querySelector("[data-grid-slot]");
  const chips = root.querySelector("[data-chips]");
  const search = root.querySelector("[data-search]");
  const stripSlot = root.querySelector("[data-strip-slot]");

  function refreshStrip() {
    if (!stripSlot) return;
    stripSlot.innerHTML = liveStripHTML();
  }

  function rerenderGrid() {
    gridSlot.innerHTML = gridHTML();
    bindGrid();
    refreshStrip();
  }

  function bindGrid() {
    const grid = gridSlot.querySelector("[data-grid]");
    if (grid) {
      bindProductGrid(grid, {
        onChange: () => {
          refreshStockBadges(root);
          refreshStrip();
        },
      });
    }
  }

  chips.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-filter]");
    if (!btn) return;
    activeFilter = btn.dataset.filter;
    chips.querySelectorAll("[data-filter]").forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.filter === activeFilter))
    );
    rerenderGrid();
  });

  search.addEventListener("input", () => {
    query = search.value;
    rerenderGrid();
  });

  bindGrid();

  const off = subscribe(() => {
    refreshStockBadges(root);
    refreshStrip();
  });
  ctx?.onCleanup?.(off);
}
