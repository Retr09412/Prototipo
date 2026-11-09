/* ============================================================
   App — router SPA por hash + bootstrap
   ============================================================ */

import { NAV_ITEMS, renderNav, updateBadges, bindCartTriggers } from "./components/navbar.js";
import { refreshCart, closeCart } from "./components/cartDrawer.js";
import { subscribe, cartCount, getState, cartSubtotal } from "./store.js";
import { money } from "./utils.js";
import { CatalogView } from "./components/catalog.js";
import { ReserveView } from "./components/reserve.js";
import { CheckoutView } from "./components/checkout.js";
import { ConfirmationView } from "./components/confirmation.js";
import { ProfileView } from "./components/profile.js";

const ROUTES = {
  home: { view: CatalogView, nav: "home", title: "Menú" },
  catalog: { view: CatalogView, nav: "home", title: "Menú" },
  extras: { view: CatalogView, nav: "home", title: "Menú" },
  reserve: { view: ReserveView, nav: "reserve", title: "Reservar" },
  checkout: { view: CheckoutView, nav: "reserve", title: "Pago" },
  confirmation: { view: ConfirmationView, nav: null, title: "Confirmación" },
  profile: { view: ProfileView, nav: "profile", title: "Mi cuenta" },
};

const PROTECTED = ["reserve", "checkout", "confirmation"];

let currentRoute = null;
let cleanupFns = [];

/* ---------- Navegación ---------- */
export function go(hash) {
  if (location.hash === hash) {
    renderRoute();
  } else {
    location.hash = hash;
  }
}

export function parseHash() {
  const raw = location.hash.replace(/^#\/?/, "") || "home";
  const name = raw.split("?")[0];
  return ROUTES[name] ? name : "home";
}

/* ---------- Toasts ---------- */
export function toast(message, type = "success", duration) {
  const host = document.getElementById("toastHost");
  if (!host) return;
  const ms = duration || (type === "info" ? 4200 : 2600);
  const el = document.createElement("div");
  el.className = `toast toast-${type}`;
  const iconName =
    type === "success" ? "checkCircle" : type === "error" ? "alert" : "info";
  el.innerHTML = `<span style="display:grid;place-items:center;color:${
    type === "success" ? "var(--success)" : type === "error" ? "var(--danger)" : "var(--info)"
  }">${rawIcon(iconName)}</span><span>${message}</span>`;
  host.appendChild(el);

  setTimeout(() => {
    el.classList.add("is-leaving");
    setTimeout(() => el.remove(), 260);
  }, ms);
}

/* icono inline mínimo (evita ciclo con icons.js en runtime crítico) */
function rawIcon(name) {
  const paths = {
    checkCircle: `<circle cx="12" cy="12" r="9.2"/><path d="m8 12.3 2.7 2.7L16.2 9.5"/>`,
    alert: `<path d="M12 3.5 2.8 19.5h18.4L12 3.5z"/><path d="M12 9.5v4.5M12 16.6v.6"/>`,
    info: `<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.7v.6"/>`,
  };
  return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true">${paths[name] || paths.info}</svg>`;
}

/* ---------- Barra flotante del carrito ---------- */
function ensureFab() {
  let bar = document.getElementById("cartFab");
  if (bar) return bar;
  bar = document.createElement("button");
  bar.id = "cartFab";
  bar.type = "button";
  bar.className = "cart-fab-bar";
  bar.hidden = true;
  bar.innerHTML = `
    <span class="cfb-count" data-fab-count>0</span>
    <span class="cfb-text" data-fab-total>$0.00</span>
    <span class="cfb-cta">Ver carrito
      <svg class="icon" width="16" height="16" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" stroke-width="2" stroke-linecap="round"
        stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></svg>
    </span>`;
  bar.addEventListener("click", () => {
    import("./components/cartDrawer.js").then((m) => m.openCart());
  });
  document.body.appendChild(bar);
  return bar;
}

function updateFab() {
  const bar = ensureFab();
  const n = cartCount();
  const hideOn = ["reserve", "checkout", "confirmation"];
  const suppressed = hideOn.includes(currentRoute);
  bar.hidden = n === 0 || suppressed;
  bar.querySelector("[data-fab-count]").textContent = String(n);
  bar.querySelector("[data-fab-total]").textContent = money(cartSubtotal());
}

/* ---------- Render ---------- */
function renderRoute() {
  const name = parseHash();
  const route = ROUTES[name];
  const state = getState();

  // Guardas de rutas protegidas
  if (PROTECTED.includes(name)) {
    if (name === "confirmation" && !state.lastOrder) {
      location.replace("#/home");
      return;
    }
    if ((name === "reserve" || name === "checkout") && cartCount() === 0) {
      location.replace("#/home");
      return;
    }
  }

  closeCart();
  currentRoute = name;

  const root = document.getElementById("app");
  if (!root) return;

  // Sincroniza nav activa + título de la vista
  renderNav(route.nav, name);
  document.title = `${route.title} · PoliMóvil Express`;

  // Renderiza la vista
  root.innerHTML = "";
  cleanupFns.forEach((fn) => {
    try { fn(); } catch { /* noop */ }
  });
  cleanupFns = [];

  const view = document.createElement("div");
  view.className = "view";
  view.dataset.route = name;
  root.appendChild(view);

  const ctx = {
    onCleanup(fn) {
      cleanupFns.push(fn);
    },
  };

  try {
    route.view(view, ctx);
  } catch (err) {
    console.error(`[router] error en vista "${name}"`, err);
    view.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">⚠️</div>
        <h3>Algo salió mal</h3>
        <p>No se pudo cargar esta sección. Intenta de nuevo.</p>
        <a class="btn btn-primary" href="#/home">Volver al inicio</a>
      </div>`;
  }

  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
  updateFab();
  bindCartTriggers(view);
}

/* ---------- Bootstrap ---------- */
function bootstrap() {
  if (!location.hash) location.replace("#/home");

  window.addEventListener("hashchange", renderRoute);

  subscribe(() => {
    updateBadges(cartCount());
    updateFab();
    refreshCart();
  });

  // Delegación global de atributos comunes
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-go]");
    if (el) {
      e.preventDefault();
      go(el.dataset.go);
      return;
    }

    // Reservar deshabilitado con carrito vacío: no navega
    const navReserve = e.target.closest('[data-nav="reserve"]');
    if (navReserve && navReserve.classList.contains("is-disabled")) {
      e.preventDefault();
      e.stopPropagation();
      toast("Agrega productos al carrito para reservar", "info");
    }
  });

  ensureFab();
  renderRoute();
  updateBadges(cartCount());
}

/* Exponer helpers para módulos que importan de app.js */
export { updateFab };

bootstrap();
