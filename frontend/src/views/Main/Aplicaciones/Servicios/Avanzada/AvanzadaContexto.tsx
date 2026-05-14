import type { ContextoData } from "@/types/index.js";
import "./Estilos.css";
import { trackAdvancedStepViewed } from "@/hooks/useAnalytics";
import { useEffect } from "react";

interface Props {
  readonly value: ContextoData;
  readonly onChange: (data: ContextoData) => void;
  readonly onNext: () => void;
  readonly onBack?: () => void;
  readonly status: "active" | "completed" | "invalid" | "warning";
}

function AvanzadaContexto({ value, onChange, onNext, onBack, status }: Props) {
  // Tracke paso al montar componente
  useEffect(() => {
    trackAdvancedStepViewed(1, 'contexto');
  }, []);

  function handleProjectTypeChange(newValue: "website" | "ecommerce" | "web_app") {
    onChange({ ...value, projectType: newValue });
  }

  function handleProjectStateChange(newValue: "new" | "remodel") {
    onChange({ ...value, projectState: newValue });
  }

  function handlePriorityChange(newValue: "low" | "medium" | "high") {
    onChange({ ...value, priority: newValue });
  }

  function validateContexto(): { ok: boolean; error?: string } {
    if (!value.projectType || !["website", "ecommerce", "web_app"].includes(value.projectType)) {
      return { ok: false, error: "Seleccioná el tipo de proyecto" };
    }

    if (!value.projectState || !["new", "remodel"].includes(value.projectState)) {
      return { ok: false, error: "Indicá si es nuevo o remodelación" };
    }

    return { ok: true };
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const validation = validateContexto();
    if (!validation.ok) {
      if (status === "active") {
        window.dispatchEvent(new CustomEvent("setStepStatus", { detail: { step: "contexto", status: "invalid" } }));
      }
      return;
    }

    onNext();
  }

  return (
    <form className="avanzada__step-form" onSubmit={handleSubmit} noValidate>
      <fieldset className={`quick-quote__field`} disabled={status === "completed"}>
        <legend>¿Qué tipo de web necesitas? *</legend>
        
        <div className="form-option-group">
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
                {type === "website" ? "Sitio Informativo o Corporativo" : type === "ecommerce" ? "Tienda Online con Carrito" : "Aplicación Web Compleja"}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={`quick-quote__field`} disabled={status === "completed"}>
        <legend>¿Tienes un sitio web actualmente? *</legend>
        
        <div className="form-option-group">
          {(["new", "remodel"] as const).map((state) => (
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
                {state === "new" && "✨ "}
                {state === "remodel" && "🛠️ "}
                {state === "new" ? "No, empezamos desde cero" : "Sí, quiero mejorar el que tengo"}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className={`quick-quote__field`} disabled={status === "completed"}>
        <legend>¿Para cuándo lo necesitas listo? *</legend>
        
        <div className="form-option-group">
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
                {priority === "low" && "📆 "}
                {priority === "medium" && "⏱️ "}
                {priority === "high" && "🚀 "}
                {priority === "low" ? "Tengo tiempo, sin apuro" : priority === "medium" ? "Ritmo normal (1-2 meses)" : "Lo necesito urgente"}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {/* Hidden country field since it's required by backend but bad UX */}
      <input type="hidden" name="country" value="CL" />

      {/* Footer con validación */}
      <footer className="avanzada__step-footer">
        {onBack && (
          <button type="button" onClick={onBack} className="quick-quote__submit" style={{ background: "rgba(255,255,255,0.05)", color: "#ccc", border: "1px solid rgba(255,255,255,0.1)", flex: "none" }}>
            Atrás
          </button>
        )}
        
        <div style={{ flex: 1 }}>
          <button 
            type="submit" 
            className="quick-quote__submit"
            disabled={status === "invalid"}
            style={{ width: "100%" }}
          >
            {status === "active" ? "Siguiente" : status === "completed" ? "✓ Completado" : `Corregí`}
          </button>
        </div>
      </footer>
    </form>
  );
}

export default AvanzadaContexto;
