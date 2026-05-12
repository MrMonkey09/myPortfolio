import type { ContextoData } from "@/types/index.js";
import "./Estilos.css";

interface Props {
  readonly value: ContextoData;
  readonly onChange: (data: ContextoData) => void;
  readonly onNext: () => void;
  readonly status: "active" | "completed" | "invalid" | "warning";
}

function AvanzadaContexto({ value, onChange, onNext, status }: Props) {
  function handleProjectTypeChange(newValue: "website" | "ecommerce" | "web_app") {
    onChange({ ...value, projectType: newValue });
  }

  function handleProjectStateChange(newValue: "new" | "remodelacion") {
    onChange({ ...value, projectState: newValue });
  }

  function handlePriorityChange(newValue: "low" | "medium" | "high") {
    onChange({ ...value, priority: newValue });
  }

  function validateContexto(): { ok: boolean; error?: string } {
    if (!value.projectType || !["website", "ecommerce", "web_app"].includes(value.projectType)) {
      return { ok: false, error: "Seleccioná el tipo de proyecto" };
    }

    if (!value.projectState || !["new", "remodelacion"].includes(value.projectState)) {
      return { ok: false, error: "Indicá si es nuevo o remodelación" };
    }

    return { ok: true };
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const validation = validateContexto();
    if (!validation.ok) {
      status === "active" ? (window.dispatchEvent(new CustomEvent("setStepStatus", { detail: { step: "contexto", status: "invalid" } })) : null);
      return;
    }

    onNext();
  }

  return (
    <form className="avanzada__step-form" onSubmit={handleSubmit} noValidate>
      <fieldset className={`quick-quote__field`} disabled={status === "completed"}>
        <legend>Tipo de Proyecto *</legend>
        
        <div className="form-select-group">
          {(["website", "ecommerce", "web_app"] as const).map((type) => (
            <label key={type} className={`form-option ${value.projectType === type ? "avanzada__step-selected" : ""}`}>
              <input
                type="radio"
                name="project_type"
                value={type}
                checked={value.projectType === type}
                onChange={() => handleProjectTypeChange(type)}
                disabled={status === "completed"}
              />
              <span className={`form-option-name ${value.projectType === type ? "avanzada__step-highlight" : ""}`}>
                {type === "website" && "🌐 "}
                {type === "ecommerce" && "🛒 "}
                {type === "web_app" && "📱 "}
                {type === "website" ? "Sitio Web Institucional" : type === "ecommerce" ? "E-commerce con Carrito" : "Web App Completa"}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={`quick-quote__field`} disabled={status === "completed"}>
        <legend>Estado del Proyecto *</legend>
        
        <div className="form-select-group">
          {(["new", "remodelacion"] as const).map((state) => (
            <label key={state} className={`form-option ${value.projectState === state ? "avanzada__step-selected" : ""}`}>
              <input
                type="radio"
                name="project_state"
                value={state}
                checked={value.projectState === state}
                onChange={() => handleProjectStateChange(state)}
                disabled={status === "completed"}
              />
              <span className={`form-option-name ${value.projectState === state ? "avanzada__step-highlight" : ""}`}>
                {state === "new" && "🆕 "}
                {state === "remodelacion" && "♻️ "}
                {state === "new" ? "Nueva Web" : "Remodelación"}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={`quick-quote__field`} disabled={status === "completed"}>
        <legend>País de Cliente *</legend>
        
        <input
          type="text"
          name="country"
          id="country"
          value={value.country}
          onChange={(e) => {
            const newValue = e.target.value.toUpperCase();
            if (newValue.length <= 2) {
              onChange({ ...value, country: newValue });
            }
          }}
          disabled={status === "completed"}
          placeholder="Ej: CL"
        />
        <span className="quick-quote__field-hint">Max. 2 letras mayúsculas</span>
      </fieldset>

      <fieldset className={`quick-quote__field`} disabled={status === "completed"}>
        <legend>Prioridad *</legend>
        
        <div className="form-select-group">
          {(["low", "medium", "high"] as const).map((priority) => (
            <label key={priority} className={`form-option ${value.priority === priority ? "avanzada__step-selected" : ""}`}>
              <input
                type="radio"
                name="urgency"
                value={priority}
                checked={value.priority === priority}
                onChange={() => handlePriorityChange(priority)}
                disabled={status === "completed"}
              />
              <span className={`form-option-name ${value.priority === priority ? "avanzada__step-highlight" : ""}`}>
                {priority === "low" && "🐌 "}
                {priority === "medium" && "🚶 "}
                {priority === "high" && "🏃 "}
                {priority === "low" ? "Baja" : priority === "medium" ? "Media" : "Alta"}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <footer className="avanzada__step-footer">
        <button 
          type="submit" 
          className="quick-quote__submit"
          disabled={status === "validating"}
        >
          {status === "active" ? "Siguiente" : status === "completed" ? "✓ Completado" : `Corregí errores`}
        </button>
        {Object.values(value).filter(Boolean).length > 0 && (
          <span className="quick-quote__field-hint">
            {value.country && value.projectType && value.projectState ? "Todo completo" : "Faltan campos"}
          </span>
        )}
      </footer>
    </form>
  );
}

export default AvanzadaContexto;
