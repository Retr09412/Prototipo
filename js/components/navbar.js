/* ============================================================
   Navbar — bottom nav (móvil) + sidebar (desktop) + topbar
   Mismo DOM para ambas vistas; el CSS controla la variante.
   ============================================================ */

import { icon } from "../icons.js";
import { cartCount, getState } from "../store.js";
import { openCart } from "./cartDrawer.js";

export const NAV_ITEMS = [
  { id: "home", label: "Menú", short: "Menú", icon: "grid", href: "#/home" },
  { id: "reserve", label: "Reservar", short: "Reservar", icon: "calendar", href: "#/reserve" },
  { id: "profile", label: "Mi Cuenta", short: "Perfil", icon: "user", href: "#/profile" },
];

const PAGE_TITLES = {
  home: "Menú",
  catalog: "Menú",
  extras: "Menú",
  reserve: "Reserva tu pedido",
  checkout: "Pago",
  confirmation: "Pedido confirmado",
  profile: "Mi cuenta",
};

function brandHTML() {
  return `
    <div class="brand-mark" aria-hidden="true">P</div>
    <div class="brand-text">
      <span class="brand-name">PoliMóvil</span>
      <span class="brand-sub">Express · Campus ESPOL</span>
    </div>
  `;
}

function navLinksHTML(activeId, withBadge) {
  return NAV_ITEMS.map((item) => {
    const isActive = item.id === activeId;
    const badge =
      withBadge && item.id === "home"
        ? `<span class="nav-badge" data-cart-badge hidden>0</span>`
        : "";
    return `
      <a href="${item.href}" class="nav-item ${isActive ? "is-active" : ""}"
         ${isActive ? 'aria-current="page"' : ""} data-nav="${item.id}">
        ${icon(item.icon)}
        <span>${item.label}</span>
        ${badge}
      </a>`;
  }).join("");
}

function bottomLinksHTML(activeId) {
  return NAV_ITEMS.map((item) => {
    const isActive = item.id === activeId;
    return `
      <a href="${item.href}" class="${isActive ? "is-active" : ""}"
         ${isActive ? 'aria-current="page"' : ""} data-nav="${item.id}">
        ${icon(item.icon, { size: 24 })}
        <span>${item.short}</span>
      </a>`;
  }).join("");
}

export function renderNav(activeId, titleKey) {
  const sidebar = document.getElementById("sidebar");
  const bottom = document.getElementById("bottomNav");
  const topbar = document.getElementById("topbar");

  if (sidebar) {
    sidebar.innerHTML = `
      <div class="sidebar-brand">${brandHTML()}</div>
      <div class="nav-group-label">Navegación</div>
      ${navLinksHTML(activeId, true)}
      <div class="sidebar-foot">
        <div class="avatar" aria-hidden="true">NH</div>
        <div class="who">
          <strong>Nicola Herrera</strong>
          <span>Puntos: <b data-points-label>0</b> pts</span>
        </div>
      </div>
    `;
  }

  if (bottom) {
    bottom.innerHTML = bottomLinksHTML(activeId);
  }

  if (topbar) {
    const title = PAGE_TITLES[titleKey || activeId] || "PoliMóvil Express";
    topbar.innerHTML = `
      <div class="topbar-brand">
        <div class="brand-mark" aria-hidden="true">P</div>
        <div class="brand-text">
          <span class="brand-name">${title}</span>
          <span class="brand-sub">Grab &amp; Go · Sin filas</span>
        </div>
      </div>
      <div class="topbar-actions">
        <button class="btn-icon cart-btn" type="button" data-open-cart
                aria-label="Abrir carrito">
          ${icon("cart")}
          <span class="cart-count" data-cart-count hidden>0</span>
        </button>
      </div>
    `;
  }

  bindCartTriggers(document);
  updateBadges();
}

/** Actualiza contadores de carrito y puntos en toda la UI. */
export function updateBadges(count) {
  const n = typeof count === "number" ? count : cartCount();

  document.querySelectorAll("[data-cart-count]").forEach((el) => {
    el.textContent = n > 99 ? "99+" : String(n);
    el.hidden = n === 0;
  });
  document.querySelectorAll("[data-cart-badge]").forEach((el) => {
    el.textContent = String(n);
    el.hidden = n === 0;
  });

  document.querySelectorAll("[data-points-label]").forEach((el) => {
    el.textContent = String(getState().user.points);
  });

  // La barra flotante del carrito la gestiona app.js (updateFab)
}

export function bindCartTriggers(scope) {
  scope.querySelectorAll("[data-open-cart]").forEach((btn) => {
    if (btn.dataset.bound) return;
    btn.dataset.bound = "1";
    btn.addEventListener("click", () => openCart());
  });
}
