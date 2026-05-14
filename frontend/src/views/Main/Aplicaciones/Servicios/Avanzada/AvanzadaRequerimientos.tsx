import type { RequerimientosData } from "@/types/index.js";
import "./Estilos.css";
import { trackAdvancedStepViewed } from "@/hooks/useAnalytics";
import { useEffect } from "react";

interface Props {
  readonly value: RequerimientosData;
  readonly onChange: (data: RequerimientosData) => void;
  readonly onNext: () => void;
  readonly onBack?: () => void;
  readonly status: "active" | "completed" | "invalid" | "warning";
}

function AvanzadaRequerimientos({ value, onChange, onNext, onBack, status }: Props) {
  // Tracke paso al montar componente
  useEffect(() => {
    trackAdvancedStepViewed(2, 'requerimientos');
  }, []);

  function handleChange(key: keyof RequerimientosData, newValue: "yes" | "no") {
    onChange({ ...value, [key]: newValue });
  }

  function validateRequerimientos(): { ok: boolean; error?: string } {
    // At least something should be checked or we just allow empty? 
    // Usually design is mandatory for new projects, but let's just keep it simple.
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

  return (
    <form className="avanzada__step-form" onSubmit={handleSubmit} noValidate>
      
      <fieldset className={`quick-quote__field`} disabled={status === "completed"}>
        <legend>¿Tienes tu identidad visual definida? (Logo, colores, tipografías) *</legend>
        <div className="form-option-group">
          <label className={`form-option ${value.diseno === "no" ? "avanzada__step-selected" : ""}`}>
            <input
              type="radio"
              name="req_diseno"
              checked={value.diseno === "no"}
              onChange={() => handleChange("diseno", "no")}
              disabled={status === "completed"}
            />
            <span className={`form-option-name ${value.diseno === "no" ? "avanzada__step-highlight" : ""}`}>
              ✅ Sí, tengo mi manual de marca listo
            </span>
          </label>
          <label className={`form-option ${value.diseno === "yes" ? "avanzada__step-selected" : ""}`}>
            <input
              type="radio"
              name="req_diseno"
              checked={value.diseno === "yes"}
              onChange={() => handleChange("diseno", "yes")}
              disabled={status === "completed"}
            />
            <span className={`form-option-name ${value.diseno === "yes" ? "avanzada__step-highlight" : ""}`}>
              🎨 No, necesito que diseñen mi identidad visual
            </span>
          </label>
        </div>
      </fieldset>

      <fieldset className={`quick-quote__field`} disabled={status === "completed"}>
        <legend>Textos e Imágenes de la web *</legend>
        <div className="form-option-group">
          <label className={`form-option ${value.redaccion === "no" ? "avanzada__step-selected" : ""}`}>
            <input
              type="radio"
              name="req_redaccion"
              checked={value.redaccion === "no"}
              onChange={() => handleChange("redaccion", "no")}
              disabled={status === "completed"}
            />
            <span className={`form-option-name ${value.redaccion === "no" ? "avanzada__step-highlight" : ""}`}>
              📸 Yo entregaré todos los textos y fotos
            </span>
          </label>
          <label className={`form-option ${value.redaccion === "yes" ? "avanzada__step-selected" : ""}`}>
            <input
              type="radio"
              name="req_redaccion"
              checked={value.redaccion === "yes"}
              onChange={() => handleChange("redaccion", "yes")}
              disabled={status === "completed"}
            />
            <span className={`form-option-name ${value.redaccion === "yes" ? "avanzada__step-highlight" : ""}`}>
              ✍️ Necesito servicio de Redacción (Copywriting)
            </span>
          </label>
        </div>
      </fieldset>

      <fieldset className={`quick-quote__field`} disabled={status === "completed"}>
        <legend>Crecimiento y Estrategia (Opcional)</legend>
        <div className="form-option-group">
          <label className={`form-option ${value.seo === "yes" ? "avanzada__step-selected" : ""}`}>
            <input
              type="checkbox"
              name="req_seo"
              checked={value.seo === "yes"}
              onChange={(e) => handleChange("seo", e.target.checked ? "yes" : "no")}
              disabled={status === "completed"}
            />
            <span className={`form-option-name ${value.seo === "yes" ? "avanzada__step-highlight" : ""}`}>
              🔍 Optimización SEO (Aparecer en Google)
            </span>
          </label>
          <label className={`form-option ${value.analytics === "yes" ? "avanzada__step-selected" : ""}`}>
            <input
              type="checkbox"
              name="req_analytics"
              checked={value.analytics === "yes"}
              onChange={(e) => handleChange("analytics", e.target.checked ? "yes" : "no")}
              disabled={status === "completed"}
            />
            <span className={`form-option-name ${value.analytics === "yes" ? "avanzada__step-highlight" : ""}`}>
              📊 Google Analytics (Medir mis visitas)
            </span>
          </label>
        </div>
      </fieldset>

      {/* Hidden field so `desarrollo` is always true, which makes totalAreas > 0 */}
      <input type="hidden" name="req_desarrollo" value="true" />

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

export default AvanzadaRequerimientos;
