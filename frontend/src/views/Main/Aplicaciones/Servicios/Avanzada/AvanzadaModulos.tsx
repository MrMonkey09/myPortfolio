import type { ModuloLinea, RequerimientosData } from "@/types/index.js";
import "./Estilos.css";
import { trackAdvancedStepViewed } from "@/hooks/useAnalytics";
import { useEffect } from "react";

interface Props {
  readonly value: readonly ModuloLinea[];
  readonly onChange: (modulos: readonly ModuloLinea[]) => void;
  readonly onNext: () => void;
  readonly onBack?: () => void;
  readonly status: "active" | "completed" | "invalid" | "warning";
  readonly requerimientos: RequerimientosData;
}

function AvanzadaModulos({ value: modulos, onChange, onNext, onBack, status, requerimientos }: Props) {
  useEffect(() => {
    trackAdvancedStepViewed(3, 'modulos');
  }, []);

  // Sync requerimientos → módulos al montar el componente
  useEffect(() => {
    let changed = false;
    const synced = modulos.map((m) => {
      if (m.module_id === "diseno-ui-ux" && requerimientos.diseno === "yes" && m.include === "no") {
        changed = true;
        return { ...m, include: "yes" as const, quantity: Math.max(m.quantity, 1), complexity: "medium" as const };
      }
      if (m.module_id === "contenido" && requerimientos.redaccion === "yes" && m.include === "no") {
        changed = true;
        return { ...m, include: "yes" as const, quantity: Math.max(m.quantity, 1), complexity: "medium" as const };
      }
      return m;
    });
    if (changed) onChange(synced);
  }, []); // Solo al montar

  // Helpers to get/set logic from the underlying technical array
  const pagesQuantity = modulos.find((m) => m.module_id === "desarrollo-frontend")?.quantity || 1;
  const hasBackend = modulos.find((m) => m.module_id === "backend-api")?.include === "yes";
  const hasEcommerce = modulos.find((m) => m.module_id === "ecommerce")?.include === "yes";
  const hasSeo = modulos.find((m) => m.module_id === "seo-busqueda")?.include === "yes";
  const hasDesign = modulos.find((m) => m.module_id === "diseno-ui-ux")?.include === "yes";
  const hasContent = modulos.find((m) => m.module_id === "contenido")?.include === "yes";
  const hasAnalytics = modulos.find((m) => m.module_id === "analytics")?.include === "yes";
  const hasCatalogo = modulos.find((m) => m.module_id === "catalogo")?.include === "yes";

  function handlePagesChange(qty: number) {
    const validQty = Math.max(1, qty);
    onChange(
      modulos.map((m) => {
        if (m.module_id === "desarrollo-frontend") {
          return { ...m, include: "yes", quantity: validQty, complexity: "medium" };
        }
        if (m.module_id === "diseno-ui-ux" && m.include === "yes") {
          return { ...m, quantity: validQty };
        }
        return m;
      })
    );
  }

  function handleToggleFeature(moduleId: string, enable: boolean, defaultQty: number = 1) {
    onChange(
      modulos.map((m) => {
        if (m.module_id === moduleId) {
          return {
            ...m,
            include: enable ? "yes" : "no",
            quantity: enable ? Math.max(m.quantity, defaultQty) : 0,
            complexity: "medium",
          };
        }
        return m;
      })
    );
  }

  function validateModulos(): { ok: boolean; error?: string } {
    const includedModules = modulos.filter((m) => m.include === "yes");
    if (includedModules.length === 0) {
      return { ok: false, error: "Debes tener al menos 1 sección en tu web" };
    }
    return { ok: true };
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const validation = validateModulos();
    if (!validation.ok) {
      window.dispatchEvent(new CustomEvent("setStepStatus", { detail: { step: "modulos", status: "invalid" } as const }));
      return;
    }
    onNext();
  }

  if (!modulos || modulos.length < 5) {
    return <div className="avanzada-error">Cargando módulos...</div>;
  }

  return (
    <form className="avanzada__step-form" onSubmit={handleSubmit} noValidate>
      <header className="modulos__header">
        <h3>Parrilla de Funcionalidades</h3>
        <p>Seleccioná los módulos que necesite tu proyecto. Los que marcamos vienen de tus respuestas anteriores — podés cambiarlos.</p>
      </header>

      {/* Páginas Principales — ocupa todo el ancho */}
      <fieldset className={`modulos__field modulos__field--active`} disabled={status === "completed"}>
        <legend className="modulos__name">
          📄 Páginas y Secciones Informativas
        </legend>
        <div className="modulos__actions" style={{ flexDirection: "column", gap: "0.5rem" }}>
          <label className="quick-quote__field">
            <span>¿Cuántas páginas o secciones informativas tendrá tu web?</span>
            <input
              type="number"
              min={1}
              value={pagesQuantity}
              onChange={(e) => handlePagesChange(Number(e.target.value))}
              disabled={status === "completed"}
            />
          </label>
        </div>
      </fieldset>

      {/* Fila 1: Diseño UI/UX | Copywriting */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <fieldset className={`modulos__field ${hasDesign ? "modulos__field--active" : ""}`} disabled={status === "completed"}>
          <legend className="modulos__name">🎨 Diseño UI/UX</legend>
          <label className={`form-option ${hasDesign ? "avanzada__step-selected" : ""}`}>
            <input
              type="checkbox"
              checked={hasDesign}
              onChange={(e) => handleToggleFeature("diseno-ui-ux", e.target.checked, pagesQuantity)}
              disabled={status === "completed"}
            />
            <span>{hasDesign ? "✅ Incluido" : "❌ No incluido"}</span>
          </label>
        </fieldset>

        <fieldset className={`modulos__field ${hasContent ? "modulos__field--active" : ""}`} disabled={status === "completed"}>
          <legend className="modulos__name">✍️ Copywriting</legend>
          <label className={`form-option ${hasContent ? "avanzada__step-selected" : ""}`}>
            <input
              type="checkbox"
              checked={hasContent}
              onChange={(e) => handleToggleFeature("contenido", e.target.checked, 1)}
              disabled={status === "completed"}
            />
            <span>{hasContent ? "✅ Incluido" : "❌ No incluido"}</span>
          </label>
        </fieldset>
      </div>

      {/* Fila 2: SEO Pro | Analytics */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <fieldset className={`modulos__field ${hasSeo ? "modulos__field--active" : ""}`} disabled={status === "completed"}>
          <legend className="modulos__name">🔍 SEO Pro</legend>
          <label className={`form-option ${hasSeo ? "avanzada__step-selected" : ""}`}>
            <input
              type="checkbox"
              checked={hasSeo}
              onChange={(e) => handleToggleFeature("seo-busqueda", e.target.checked, 1)}
              disabled={status === "completed"}
            />
            <span>{hasSeo ? "✅ Incluido" : "❌ No incluido"}</span>
          </label>
        </fieldset>

        <fieldset className={`modulos__field ${hasAnalytics ? "modulos__field--active" : ""}`} disabled={status === "completed"}>
          <legend className="modulos__name">📊 Analytics</legend>
          <label className={`form-option ${hasAnalytics ? "avanzada__step-selected" : ""}`}>
            <input
              type="checkbox"
              checked={hasAnalytics}
              onChange={(e) => handleToggleFeature("analytics", e.target.checked, 1)}
              disabled={status === "completed"}
            />
            <span>{hasAnalytics ? "✅ Incluido" : "❌ No incluido"}</span>
          </label>
        </fieldset>
      </div>

      {/* Fila 3: Tienda Online | Backend/API */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <fieldset className={`modulos__field ${hasEcommerce ? "modulos__field--active" : ""}`} disabled={status === "completed"}>
          <legend className="modulos__name">🛒 Tienda Online</legend>
          <label className={`form-option ${hasEcommerce ? "avanzada__step-selected" : ""}`}>
            <input
              type="checkbox"
              checked={hasEcommerce}
              onChange={(e) => handleToggleFeature("ecommerce", e.target.checked, 10)}
              disabled={status === "completed"}
            />
            <span>{hasEcommerce ? "✅ Incluido" : "❌ No incluido"}</span>
          </label>
        </fieldset>

        <fieldset className={`modulos__field ${hasBackend ? "modulos__field--active" : ""}`} disabled={status === "completed"}>
          <legend className="modulos__name">🔐 Backend / API</legend>
          <label className={`form-option ${hasBackend ? "avanzada__step-selected" : ""}`}>
            <input
              type="checkbox"
              checked={hasBackend}
              onChange={(e) => handleToggleFeature("backend-api", e.target.checked, 1)}
              disabled={status === "completed"}
            />
            <span>{hasBackend ? "✅ Incluido" : "❌ No incluido"}</span>
          </label>
        </fieldset>
      </div>

      {/* Fila 4: Catálogo de Productos (solo, centrado) */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
        <fieldset className={`modulos__field ${hasCatalogo ? "modulos__field--active" : ""}`} disabled={status === "completed"}>
          <legend className="modulos__name">📦 Catálogo de Productos</legend>
          <label className={`form-option ${hasCatalogo ? "avanzada__step-selected" : ""}`}>
            <input
              type="checkbox"
              checked={hasCatalogo}
              onChange={(e) => handleToggleFeature("catalogo", e.target.checked, 5)}
              disabled={status === "completed"}
            />
            <span>{hasCatalogo ? "✅ Incluido" : "❌ No incluido"}</span>
          </label>
        </fieldset>

        {/* Celda vacía para mantener el grid */}
        <div />
      </div>

      {/* Footer */}
      <footer className="avanzada__step-footer" style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginTop: "2rem" }}>
        {onBack && (
          <button type="button" onClick={onBack} className="quick-quote__submit" style={{ backgroundColor: "#e0e0e0", color: "#333", flex: "none" }}>
            Atrás
          </button>
        )}
        <button type="submit" className="quick-quote__submit" disabled={status === "validating"} style={{ flex: 1 }}>
          {status === "active" ? "Siguiente" : status === "completed" ? "✓ Completado" : `Corregí errores`}
        </button>
      </footer>
    </form>
  );
}

export default AvanzadaModulos;
