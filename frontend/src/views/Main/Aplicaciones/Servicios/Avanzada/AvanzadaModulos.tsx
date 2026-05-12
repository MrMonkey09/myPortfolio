import type { ModuloLinea } from "@/types/index.js";
import Configuracion from "./Configuracion.js";
import "./Estilos.css";
import { trackAdvancedStepViewed } from "@/hooks/useAnalytics";
import { useEffect } from "react";

interface Props {
  readonly modulos: readonly ModuloLinea[];
  readonly onChange: (modulos: readonly ModuloLinea[]) => void;
  readonly onNext: () => void;
  readonly status: "active" | "completed" | "invalid" | "warning";
}

function AvanzadaModulos({ modulos, onChange, onNext, status }: Props) {
  // Tracke paso al montar componente
  useEffect(() => {
    trackAdvancedStepViewed(3, 'modulos');
  }, []);
  function updateInclude(moduleId: string, newValue: "yes" | "optional" | "no") {
    onChange(modulos.map(m => 
      m.module_id === moduleId ? { ...m, include: newValue } : m
    ));
  }

  function updateQuantity(moduleId: string, newValue: number) {
    const existingModule = modulos.find(m => m.module_id === moduleId);
    if (!existingModule || newValue <= 0) return;
    
    onChange(modulos.map(m => 
      m.module_id === moduleId ? { ...m, quantity: newValue } : m
    ));
  }

  function updateComplexity(moduleId: string, newValue: "low" | "medium" | "high") {
    const existingModule = modulos.find(m => m.module_id === moduleId);
    if (!existingModule) return;
    
    onChange(modulos.map(m => 
      m.module_id === moduleId ? { ...m, complexity: newValue } : m
    ));
  }

  function validateModulos(): { ok: boolean; error?: string } {
    const includedModules = modulos.filter(m => m.include === "yes");
    
    if (includedModules.length === 0) {
      return { ok: false, error: "Seleccioná al menos 1 módulo con Include=yes" };
    }

    // Verificar cantidad válida
    for (const module of includedModules) {
      if (module.quantity <= 0) {
        return { ok: false, error: `Cantidad de módulos para "${module.module_name}" debe ser > 0` };
      }

      // Verificar complejidad seteada a un valor válido
      if (!["low", "medium", "high"].includes(module.complexity)) {
        return { ok: false, error: `Complejidad no configurada para "${module.module_name}" - seleccioná alta/media/baja` };
      }
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

  // Calcular base cost total
  function getBaseCostTotal(): number {
    return modulos.reduce((total, module) => 
      module.include === "yes" ? total + (module.quantity * module.base_cost) : total, 0
    );
  }

  // Mostrar badge según recommended include
  function getIncludeBadge(module: ModuloLinea): React.ReactNode {
    switch (module.include) {
      case "no": return <span className="modulos__badge--default">-</span>;
      case "yes":
        const total = module.quantity * module.base_cost;
        const complexityLabel = module.complexity === "medium" ? "media" : 
          module.complexity === "high" ? "alta" : "baja";
        return (
          <span className="modulos__badge--yes">
            ✓ {module.quantity}x ({complexityLabel}) / {total.toLocaleString()} CLP
          </span>
        );
      case "optional": 
        const total = module.quantity * module.base_cost;
        return (
          <span className="modulos__badge--optional">
            ? {module.quantity}x / {total.toLocaleString()} CLP
          </span>
        );
    }
  }

  // Calcular costo de cada módulo incluido
  function getModuleCost(module: ModuloLinea): number {
    if (module.include !== "yes") return 0;
    return module.quantity * module.base_cost;
  }

  return (
    <form className="avanzada__step-form" onSubmit={handleSubmit} noValidate>
      {/* Header con total */}
      <header className="modulos__header">
        <h3>Módulos del Proyecto</h3>
        <div
          className="modulos__costo--total"
          role="heading"
          aria-level={1}
        >
          Costo Base Estimado: {getBaseCostTotal().toLocaleString()} CLP
        </div>
      </header>

      {/* Módulo predefinido (usar MODULOS_PREDEFINIDOS) */}
      <fieldset className="modulos__field">
        <legend className="modulos__name" id="modulo_0">
          Diseños UI/UX
          <span className="modulos__category badge--category badge--category-diseno">Diseño</span>
        </legend>

        <div className="modulos__actions">
          {/* Include select */}
          <div className="quick-quote__field">
            <label htmlFor="modulo_0" className="visually-hidden">Seleccioná el método de inclusión para Diseños UI/UX</label>
            <select
              id="modulo_0"
              value={modulos[0].include}
              onChange={(e) => updateInclude("modulo_0", e.target.value as "yes" | "optional" | "no")}
              disabled={status === "completed"}
            >
              <option value="yes">Incluir</option>
              <option value="optional">Opcional (+30%)</option>
              <option value="no">No requerido</option>
            </select>
          </div>

          {/* Cantidad input - conditional */}
          <label className={`quick-quote__field ${modulos[0].include !== "yes" && modulos[0].quantity === 0 ? "disabled" : ""}`}>
            <span>Cantidad</span>
            <input 
              type="number" 
              min={1}
              value={modulos[0].quantity}
              onChange={(e) => updateQuantity("modulo_0", Number(e.target.value))}
              disabled={status === "completed" || (modulos[0].include !== "yes")}
            />
          </label>

          {/* Complejidad select */}
          <div className={`quick-quote__field ${getBaseCostTotal() < modulos[0].base_cost && modulos[0].include === "yes" && modulos[0].quantity === 1 ? "disabled active" : ""}`}>
            <select 
              value={modulos[0].complexity}
              onChange={(e) => updateComplexity("modulo_0", e.target.value as "low" | "medium" | "high")}
              disabled={status === "completed"}
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>

          {/* Badge */}
          {getIncludeBadge(modulos[0])}
        </div>
      </fieldset>

      <fieldset className="modulos__field">
        <legend className="modulos__name" id="modulo_1">
          Desarrollo Frontend
          <span className="modulos__category badge--category badge--category-desarrollo">Desarrollo</span>
        </legend>

        <div className="modulos__actions">
          <select 
            value={modulos[1].include}
            onChange={(e) => updateInclude("modulo_1", e.target.value as "yes" | "optional" | "no")}
            disabled={status === "completed"}
          >
            <option value="yes">Incluir</option>
            <option value="optional">Opcional (+30%)</option>
            <option value="no">No requerido</option>
          </select>

          <label className={`quick-quote__field ${modulos[1].include !== "yes" && modulos[1].quantity === 0 ? "disabled" : ""}`}>
            <span>Cantidad</span>
            <input 
              type="number" 
              min={1}
              value={modulos[1].quantity}
              onChange={(e) => updateQuantity("modulo_1", Number(e.target.value))}
              disabled={status === "completed" || modulos[1].include !== "yes"}
            />
          </label>

          <div className={`quick-quote__field ${getBaseCostTotal() < modulos[1].base_cost && modulos[1].include === "yes" && modulos[1].quantity === 1 ? "disabled active" : ""}`}>
            <select 
              value={modulos[1].complexity}
              onChange={(e) => updateComplexity("modulo_1", e.target.value as "low" | "medium" | "high")}
              disabled={status === "completed"}
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>

          {getIncludeBadge(modulos[1])}
        </div>
      </fieldset>

      <fieldset className="modulos__field">
        <legend className="modulos__name" id="modulo_2">
          Backend / API
          <span className="modulos__category badge--category badge--category-desarrollo">Desarrollo</span>
        </legend>

        <div className="modulos__actions">
          <select 
            value={modulos[2].include}
            onChange={(e) => updateInclude("modulo_2", e.target.value as "yes" | "optional" | "no")}
            disabled={status === "completed"}
          >
            <option value="yes">Incluir</option>
            <option value="optional">Opcional (+30%)</option>
            <option value="no">No requerido</option>
          </select>

          <label className={`quick-quote__field ${modulos[2].include !== "yes" && modulos[2].quantity === 0 ? "disabled" : ""}`}>
            <span>Cantidad</span>
            <input 
              type="number" 
              min={1}
              value={modulos[2].quantity}
              onChange={(e) => updateQuantity("modulo_2", Number(e.target.value))}
              disabled={status === "completed" || modulos[2].include !== "yes"}
            />
          </label>

          <div className={`quick-quote__field ${getBaseCostTotal() < modulos[2].base_cost && modulos[2].include === "yes" && modulos[2].quantity === 1 ? "disabled active" : ""}`}>
            <select 
              value={modulos[2].complexity}
              onChange={(e) => updateComplexity("modulo_2", e.target.value as "low" | "medium" | "high")}
              disabled={status === "completed"}
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>

          {getIncludeBadge(modulos[2])}
        </div>
      </fieldset>

      <fieldset className="modulos__field">
        <legend className="modulos__name" id="modulo_3">
          E-commerce / Carrito
          <span className="modulos__category badge--category badge--category-ecommerce">Ecommerce</span>
        </legend>

        <div className="modulos__actions">
          <select 
            value={modulos[3].include}
            onChange={(e) => updateInclude("modulo_3", e.target.value as "yes" | "optional" | "no")}
            disabled={status === "completed"}
          >
            <option value="yes">Incluir</option>
            <option value="optional">Opcional (+30%)</option>
            <option value="no">No requerido</option>
          </select>

          <label className={`quick-quote__field ${modulos[3].include !== "yes" && modulos[3].quantity === 0 ? "disabled" : ""}`}>
            <span>Cantidad</span>
            <input 
              type="number" 
              min={1}
              value={modulos[3].quantity}
              onChange={(e) => updateQuantity("modulo_3", Number(e.target.value))}
              disabled={status === "completed" || modulos[3].include !== "yes"}
            />
          </label>

          <div className={`quick-quote__field ${getBaseCostTotal() < modulos[3].base_cost && modulos[3].include === "yes" && modulos[3].quantity === 1 ? "disabled active" : ""}`}>
            <select 
              value={modulos[3].complexity}
              onChange={(e) => updateComplexity("modulo_3", e.target.value as "low" | "medium" | "high")}
              disabled={status === "completed"}
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>

          {getIncludeBadge(modulos[3])}
        </div>
      </fieldset>

      <fieldset className="modulos__field">
        <legend className="modulos__name" id="modulo_4">
          SEO / Optimización búsqueda
          <span className="modulos__category badge--category badge--category-marketing">Marketing</span>
        </legend>

        <div className="modulos__actions">
          <select 
            value={modulos[4].include}
            onChange={(e) => updateInclude("modulo_4", e.target.value as "yes" | "optional" | "no")}
            disabled={status === "completed"}
          >
            <option value="yes">Incluir</option>
            <option value="optional">Opcional (+30%)</option>
            <option value="no">No requerido</option>
          </select>

          <label className={`quick-quote__field ${modulos[4].include !== "yes" && modulos[4].quantity === 0 ? "disabled" : ""}`}>
            <span>Cantidad</span>
            <input 
              type="number" 
              min={1}
              value={modulos[4].quantity}
              onChange={(e) => updateQuantity("modulo_4", Number(e.target.value))}
              disabled={status === "completed" || modulos[4].include !== "yes"}
            />
          </label>

          <div className={`quick-quote__field ${getBaseCostTotal() < modulos[4].base_cost && modulos[4].include === "yes" && modulos[4].quantity === 1 ? "disabled active" : ""}`}>
            <select 
              value={modulos[4].complexity}
              onChange={(e) => updateComplexity("modulo_4", e.target.value as "low" | "medium" | "high")}
              disabled={status === "completed"}
            >
              <option value="low">Baja</option>
              <option value="medium">Media</option>
              <option value="high">Alta</option>
            </select>
          </div>

          {getIncludeBadge(modulos[4])}
        </div>
      </fieldset>

      {/* Footer */}
      <footer className="avanzada__step-footer">
        <button type="submit" className="quick-quote__submit" disabled={status === "validating"}>
          {status === "active" ? "Siguiente" : status === "completed" ? "✓ Completado" : `Corregí errores`}
        </button>
      </footer>
    </form>
  );
}

export default AvanzadaModulos;
