import type { RequerimientosData } from "@/types/index.js";
import "./Estilos.css";
import { trackAdvancedStepViewed } from "@/hooks/useAnalytics";
import { useEffect } from "react";

interface Props {
  readonly value: RequerimientosData;
  readonly onChange: (data: RequerimientosData) => void;
  readonly onNext: () => void;
  readonly status: "active" | "completed" | "invalid" | "warning";
}

function AvanzadaRequerimientos({ value, onChange, onNext, status }: Props) {
  // Tracke paso al montar componente
  useEffect(() => {
    trackAdvancedStepViewed(2, 'requerimientos');
  }, []);
  function handleChange(key: keyof RequerimientosData, newValue: boolean) {
    onChange({ ...value, [key]: newValue });
  }

  function validateRequerimientos(): { ok: boolean; error?: string } {
    const totalAreas = Object.values(value).filter(Boolean).length;
    
    if (totalAreas === 0) {
      return { ok: false, error: "Seleccioná al menos 1 área de requerimiento" };
    }

    return { ok: true };
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const validation = validateRequerimientos();
    if (!validation.ok) {
      window.dispatchEvent(new CustomEvent("setStepStatus", { detail: { step: "requerimientos", status: "invalid" } as const }));
      return;
    }

    onNext();
  }

  const areaConfig = [
    { key: "diseno", icon: "🎨", label: "Diseño", desc: "UI/UX, prototipos, branding" },
    { key: "desarrollo", icon: "💻", label: "Desarrollo", desc: "Frontend, backend, integración" },
    { key: "contenido", icon: "📝", label: "Contenido", desc: "Copywriting, textos multimedia" },
    { key: "seo", icon: "🔍", label: "SEO", desc: "Optimización búsqueda online" },
    { key: "analytics", icon: "📊", label: "Analytics", desc: "Google Analytics, tracking" },
  ];

  return (
    <form className="avanzada__step-form" onSubmit={handleSubmit} noValidate>
      {/* Selector de áreas */}
      <fieldset className={`quick-quote__field`} disabled={status === "completed"}>
        <legend>Áreas Requeridas *</legend>
        
        <div className="form-select-group">
          {areaConfig.map((area) => (
            <label 
              key={area.key} 
              className={`form-option ${value[area.key] ? "avanzada__step-selected" : ""}`}
              title={`${area.label}: ${area.desc}`}
            >
              <input
                type="checkbox"
                name={`area_${area.key}`}
                checked={!!value[area.key]}
                onChange={(e) => handleChange(area.key, e.target.checked)}
                disabled={status === "completed"}
              />
              <span className={`form-option-name ${value[area.key] ? "avanzada__step-highlight" : ""}`}>
                {area.icon}
                <span>{value[area.key] ? `✓ ${area.label}` : area.label}</span>
              </span>
            </label>
          ))}
        </div>

        {/* Visual count */}
        <button 
          type="button" 
          className={`quick-quote__submit avanzada__step-counter ${Object.values(value).filter(Boolean).length === 0 ? "disabled" : ""}`}
        >
          {Object.values(value).filter(Boolean).length === 0 ? "Seleccioná al menos 1 área" : `✓ ${Object.values(value).filter(Boolean).length}/5 áreas`}
        </button>
      </fieldset>

      {/* Footer con validación */}
      <footer className="avanzada__step-footer">
        {Object.values(value).filter(Boolean).length === 0 && (
          <p className="quick-quote__message quick-quote__message--warning" role="alert">
            Seleccioná al menos 1 área para continuar
          </p>
        )}
        
        <button 
          type="submit" 
          className="quick-quote__submit"
          disabled={Object.values(value).filter(Boolean).length === 0 || status === "validating"}
        >
          {status === "active" ? "Siguiente" : status === "completed" ? "✓ Completado" : `Corregí`}
        </button>
      </footer>
    </form>
  );
}

export default AvanzadaRequerimientos;
