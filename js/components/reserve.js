/* ============================================================
   Reserva — punto de recogida + selector de horario
   - Siempre exige punto de retiro (reservables y compra rápida).
   - El horario solo aplica a reservables; en compra rápida la
     sección se muestra deshabilitada.
   Regla: desde 1 día antes hasta exactamente 1 hora antes
          de la entrega programada en el punto seleccionado.
   ============================================================ */

import { icon } from "../icons.js";
import { PICKUP_POINTS } from "../data.js";
import {
  getState, setPickup, setSlot, cartLines, cartSubtotal,
  cartHasReservable, getPickup, getSlotDate, stockOf, subscribe,
} from "../store.js";
import {
  money, generateSlots, countAvailableSlots, formatFullDate, stockInfo,
} from "../utils.js";
import { go, toast } from "../app.js";

export function ReserveView(root, ctx) {
  const state = getState();
  const needsSlot = () => cartHasReservable();

  function pickupCardHTML(p) {
    const selected = state.pickupId === p.id;
    const days = p.schedule.days
      .map((d) => ["", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"][d])
      .join(", ");
    return `
      <button class="pickup-card" type="button" role="radio"
        aria-checked="${selected}" data-pickup="${p.id}">
        <span class="pk-icon">${icon(p.icon === "book" ? "book" : p.icon === "building" ? "building" : p.icon === "utensils" ? "utensils" : "activity")}</span>
        <span class="pk-info">
          <strong>${p.name}</strong>
          <span>${p.desc}</span>
          <span style="color:var(--text-tertiary)">
            ${icon("clock", { size: 12 })} ${p.schedule.open}–${p.schedule.close} · ${days}
          </span>
        </span>
        <span class="radio-mark"></span>
      </button>`;
  }

  function slotsHTML() {
    if (!state.pickupId) {
      return `
        <div class="empty-state">
          <div class="empty-icon">${icon("mapPin")}</div>
          <h3>Elige un punto de recogida</h3>
          <p>Cada punto tiene su propio horario disponible.</p>
        </div>`;
    }

    const groups = generateSlots(state.pickupId);
    const available = countAvailableSlots(groups);

    if (!available) {
      return `
        <div class="disabled-panel" data-no-slots>
          ${icon("info")}
          <span>
            No hay horarios disponibles para este punto en la ventana de
            <strong>1 día antes → 1 hora antes</strong>. La reserva de horario
            está <strong>deshabilitada</strong> hasta nuevo cupo — prueba otro
            punto o vuelve mañana.
          </span>
        </div>`;
    }

    return groups
      .map((g) => {
        const validCount = g.slots.filter((s) => s.valid).length;
        return `
        <div class="day-group">
          <div class="day-label">
            ${icon("calendar")} ${g.label}
            <span class="badge badge-neutral" style="margin-left:auto">${validCount} disponibles</span>
          </div>
          <div class="slot-grid" role="group" aria-label="Horarios ${g.label}">
            ${g.slots
              .map(
                (s) => `
              <button class="slot" type="button"
                data-slot="${s.date.toISOString()}"
                aria-pressed="${state.slotISO === s.date.toISOString()}"
                ${s.valid ? "" : "disabled"}
                title="${s.valid ? formatFullDate(s.date) : s.hint}">
                <span>${s.label}</span>
                <span class="slot-sub">${s.valid ? "Disponible" : s.hint}</span>
              </button>`
              )
              .join("")}
          </div>
        </div>`;
      })
      .join("");
  }

  /* Sección de horario:
     - compra rápida → deshabilitada (no requerido)
     - sin cupos     → deshabilitada (no disponible) */
  function scheduleSectionHTML() {
    if (!needsSlot()) {
      return `
        <section class="section section-disabled" aria-disabled="true"
                 data-schedule-section>
          <div class="section-head">
            <h2 class="section-title">${icon("clock", { size: 18 })} 2 · Horario de entrega</h2>
            <span class="badge badge-neutral">No requerido</span>
          </div>
          <div class="disabled-panel">
            ${icon("info")}
            <span>
              Tu carrito es solo <strong>Compra Rápida</strong>: no necesitas elegir
              horario. Retiras en el punto elegido cuando quieras, sujeto al
              <strong>stock disponible</strong>.
            </span>
          </div>
        </section>`;
    }

    const groups = state.pickupId ? generateSlots(state.pickupId) : null;
    const available = groups ? countAvailableSlots(groups) : 0;
    const noSlots = Boolean(state.pickupId && !available);

    return `
      <section class="section ${noSlots ? "section-disabled" : ""}"
               ${noSlots ? 'aria-disabled="true"' : ""}
               data-schedule-section>
        <div class="section-head">
          <h2 class="section-title">${icon("clock", { size: 18 })} 2 · Horario de entrega</h2>
          ${
            noSlots
              ? '<span class="badge badge-neutral">No disponible</span>'
              : state.pickupId
                ? `<span class="badge badge-success">${available} cupos</span>`
                : ""
          }
        </div>

        ${
          noSlots
            ? ""
            : `<div class="rule-note mb-4">
                ${icon("info")}
                <span><strong>Regla de reserva:</strong> los pedidos se aceptan desde
                <strong>1 día antes</strong> hasta exactamente <strong>1 hora antes</strong>
                de la entrega programada. Los horarios fuera de esa ventana aparecen
                deshabilitados.</span>
              </div>`
        }

        <div data-slots>${slotsHTML()}</div>
      </section>`;
  }

  function lineSummaryHTML(l) {
    const stock = stockOf(l.id);
    const info = stockInfo(stock);
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
  }

  function sideHTML() {
    const lines = cartLines();
    const pickup = getPickup();
    const slot = getSlotDate();
    const slotOk = !needsSlot() || Boolean(state.slotISO);
    const ready = Boolean(state.pickupId && slotOk);
    const slotLabel = !needsSlot()
      ? '<span class="text-tertiary">Inmediato (compra rápida)</span>'
      : slot
        ? formatFullDate(slot)
        : '<span class="text-tertiary">Sin elegir</span>';

    return `
      <div class="card">
        <h2 class="section-title mb-3" style="font-size:var(--fs-md)">Tu pedido</h2>
        ${lines.map(lineSummaryHTML).join("")}
        <div class="divider"></div>
        <div class="kv-row total">
          <span class="k">Total</span>
          <span class="v">${money(cartSubtotal())}</span>
        </div>

        <div class="divider"></div>

        <div class="kv-row">
          <span class="k">${icon("mapPin", { size: 14 })} Punto</span>
          <span class="v" style="text-align:right;max-width:60%">
            ${pickup ? pickup.name : '<span class="text-tertiary">Sin elegir</span>'}
          </span>
        </div>
        <div class="kv-row">
          <span class="k">${icon("clock", { size: 14 })} Horario</span>
          <span class="v" style="text-align:right;max-width:60%">
            ${slotLabel}
          </span>
        </div>

        <button class="btn btn-primary btn-lg btn-block mt-4 side-cta" type="button"
          data-continue ${ready ? "" : "disabled"}>
          Continuar al pago ${icon("arrowRight")}
        </button>
        ${
          ready
            ? ""
            : `<p class="center mt-2 side-cta" style="font-size:var(--fs-xs);color:var(--text-tertiary)">
                 ${
                   state.pickupId
                     ? needsSlot()
                       ? "Selecciona un horario para continuar"
                       : ""
                     : "Elige un punto de recogida para continuar"
                 }
               </p>`
        }
      </div>`;
  }

  function render() {
    const fresh = getState();
    state.pickupId = fresh.pickupId;
    state.slotISO = fresh.slotISO;

    const onlyRapid = !needsSlot();
    const slotOk = !onlyRapid || Boolean(state.slotISO);
    const ready = Boolean(state.pickupId && slotOk);

    root.innerHTML = `
      <section class="view-head">
        <span class="eyebrow">${icon("calendar", { size: 14 })} Paso 2 de 3</span>
        <h1>${onlyRapid ? "Elige dónde retirar" : "Reserva tu recogida"}</h1>
        <p>${
          onlyRapid
            ? "Selecciona el punto de retiro de tu <strong>compra rápida</strong>. No necesitas horario; solo hay <strong>stock disponible</strong>."
            : 'Elige dónde y cuándo recoger. Solo puedes reservar desde <strong>1 día antes</strong> hasta <strong>1 hora antes</strong> de la entrega.'
        }</p>
      </section>

      <div class="steps" aria-label="Progreso de compra">
        <div class="step is-done"><span class="step-num">${icon("check", { size: 13 })}</span> Carrito</div>
        <div class="step-line"></div>
        <div class="step is-active"><span class="step-num">2</span> Reserva</div>
        <div class="step-line"></div>
        <div class="step"><span class="step-num">3</span> Pago</div>
      </div>

      <div class="reserve-layout">
        <div class="reserve-main">
          <section class="section">
            <div class="section-head">
              <h2 class="section-title">1 · Punto de recogida</h2>
              <span class="badge badge-accent">Obligatorio</span>
            </div>
            <div class="pickup-grid" role="radiogroup" aria-label="Puntos de recogida">
              ${PICKUP_POINTS.map(pickupCardHTML).join("")}
            </div>
          </section>

          ${scheduleSectionHTML()}
        </div>

        <aside class="reserve-side" data-side>
          ${sideHTML()}
        </aside>
      </div>

      ${(() => {
        const p = getPickup();
        const s = getSlotDate();
        const sub = !p
          ? "Elige un punto de recogida"
          : onlyRapid
            ? `${p.name} · Inmediato`
            : `${p.name}${s ? ` · ${formatFullDate(s)}` : " · sin horario"}`;
        return `
        <div class="sticky-cta">
          <div class="sticky-info">
            <span class="sticky-total">${money(cartSubtotal())}</span>
            <span class="sticky-sub">${sub}</span>
          </div>
          <button class="btn btn-primary" type="button" data-continue
            ${ready ? "" : "disabled"}>
            Continuar ${icon("arrowRight", { size: 17 })}
          </button>
        </div>
        <div class="sticky-spacer"></div>`;
      })()}
    `;

    bind();
  }

  function bind() {
    root.querySelectorAll("[data-pickup]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setPickup(btn.dataset.pickup);
        render();
        if (needsSlot()) {
          root.querySelector("[data-slots]")?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });
    });

    root.querySelectorAll("[data-slot]").forEach((btn) => {
      btn.addEventListener("click", () => {
        setSlot(btn.dataset.slot);
        render();
      });
    });

    root.querySelectorAll("[data-continue]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const s = getState();
        if (!s.pickupId) {
          toast("Elige un punto de recogida", "error");
          return;
        }
        if (cartHasReservable() && !s.slotISO) {
          toast("Elige un horario de recogida", "error");
          return;
        }
        go("#/checkout");
      });
    });
  }

  render();

  const off = subscribe(() => {
    if (document.contains(root)) render();
  });
  ctx?.onCleanup?.(off);
}
