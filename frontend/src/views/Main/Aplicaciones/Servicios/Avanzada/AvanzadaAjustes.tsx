import type { AjustesComerciales, MonthlyService } from "@/types/index.js";
import Configuracion from "./Configuracion.js";
import "./Estilos.css";

interface Props {
  readonly value: AjustesComerciales;
  readonly onChange: (ajustes: AjustesComerciales) => void;
  readonly serviciosMensuales: readonly MonthlyService[];
  readonly onChangeServicios: (servicios: MonthlyService[]) => void;
  readonly onNext: () => void;
  readonly status: "active" | "completed" | "invalid" | "warning";
}

function AvanzadaAjustes({ value, onChange, serviciosMensuales, onChangeServicios, onNext, status }: Props) {
  // Calcular total mensual de servicios seleccionados
  const totalMensual = serviciosMensuales.reduce((sum, s) => sum + (s.include === "yes" ? s.monthly_value : 0), 0);

  function setUrgency(newMultiplier: number, newLabel: string) {
    // Clamp to valid range [0.8, 1.3]
    const clamped = Math.max(0.8, Math.min(1.3, newMultiplier));
    onChange({ ...value, urgencyMultiplier: clamped });
  }

  function setContingencePct(newPct: number) {
    onChange({ ...value, contingency_pct: Number(newPct) / 100 });
  }

  function setMarginPct(newPct: number) {
    // Clamp to valid range [15%, 40%]
    const clamped = Math.max(15, Math.min(40, Number(newPct)));
    onChange({ ...value, margin_pct: clamped / 100 });
  }

  function setDiscountPct(newPct: number) {
    // Clamp to valid range [0%, 20%]
    const clamped = Math.max(0, Math.min(20, Number(newPct)));
    onChange({ ...value, discount_pct: clamped / 100 });
  }

  function setApplyVat(newVal: boolean) {
    onChange({ 
      ...value, 
      apply_vat: newVal,
      vat_pct: value.vat_pct || CONFIGURACION_AVANZADA.urgencia.low.multiplier // default placeholder
    });
  }

  function toggleServicio(serviceId: string, currentInclude: "yes" | "no") {
    onChangeServicios(serviciosMensuales.map(s => 
      s.service_id === serviceId ? { ...s, include: currentInclude === "yes" ? "no" : "yes" } : s
    ));
  }

  function validateAjustes(): { ok: boolean; error?: string } {
    // Contingencia debe ser entre 0 y 25%
    if (value.contingency_pct < 0 || value.contingency_pct > 0.25) {
      return { ok: false, error: "Contingencia debe estar entre 0% y 25%" };
    }

    // Margen debe ser entre 15% y 40%
    if (value.margin_pct < 0.15 || value.margin_pct > 0.40) {
      return { ok: false, error: "Margen debe estar entre 15% y 40%" };
    }

    // Descuento debe ser entre 0% y 20%
    if (value.discount_pct < 0 || value.discount_pct > 0.20) {
      return { ok: false, error: "Descuento debe estar entre 0% y 20%" };
    }

    // Urgencia factor debe ser válido [0.8, 1.3]
    if (value.urgencyMultiplier < CONFIGURACION_AVANZADA.urgencia.low.multiplier || 
        value.urgencyMultiplier > CONFIGURACION_AVANZADA.urgencia.high.multiplier) {
      return { ok: false, error: "Factor de urgencia debe estar entre 0.8 y 1.3" };
    }

    return { ok: true };
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    const validation = validateAjustes();
    if (!validation.ok) {
      window.dispatchEvent(new CustomEvent("setStepStatus", { detail: { step: "ajustes", status: "invalid" } as const }));
      return;
    }

    onNext();
  }

  function getContingenceSliderValue() {
    return Math.round(value.contingency_pct * 100);
  }

  function getMarginSliderValue() {
    return Math.round(value.margin_pct * 100);
  }

  function getDiscountSliderValue() {
    return Math.round(value.discount_pct * 100);
  }

  // Default values for preview
  const defaultVatPct = CONFIGURACION_AVANZADA.schema_version ? 0.19 : 0;

  // Preview de factores aplicados
  function getFactorPreview(): React.ReactNode {
    const urgencyLabel = value.urgencyMultiplier === 0.9 ? "Baja (0.9x)" : 
      value.urgencyMultiplier === 1.0 ? "Media (1.0x)" : 
      value.urgencyMultiplier === 1.25 ? "Alta (1.25x)" : `Personalizada (${value.urgencyMultiplier.toFixed(2)})`;
    
    const vatLabel = value.apply_vat ? `IVA: ${(value.vat_pct || defaultVatPct * 100).toFixed(0)}%` : "IVa: -";
    const marginRange = `${getMarginSliderValue()}%-40%`;

    return (
      <div className={`ajustes__preview ${status === "completed" ? "ajustes__preview-completed" : ""}`}>
        <h5>Factores Aplicados</h5>
        <div className="ajustes__preview-grid">
          <div title={`${urgencyLabel} (multiplier: ${value.urgencyMultiplier.toFixed(2)})`}>
            Urgencia: {urgencyLabel}
          </div>
          <div title={`Contingencia: ${getContingenceSliderValue()}%`}>
            Contingencia: {getContingenceSliderValue()}%
          </div>
          <div title={`Margen: ${getMarginSliderValue()}%`}>
            Margen: {getMarginSliderValue()}%
          </div>
          <div title={`Descuento: ${getDiscountSliderValue()}%`}>
            Descuento: {getDiscountSliderValue()}%
          </div>
          <div>{vatLabel}</div>
        </div>
      </div>
    );
  }

  return (
    <form className="avanzada__step-form" onSubmit={handleSubmit} noValidate>
      {/* Urgencia con Radio Buttons */}
      <fieldset>
        <legend>Urgencia del Proyecto</legend>
        
        <div className={`quick-quote__field avanzada__step-radio-group`}>
          {Object.entries(CONFIGURACION_AVANZADA.urgencia).map(([key, config]) => (
            <label key={key} className={`radios__option ${value.urgencyMultiplier === parseFloat(key) ? "radios__option--selected" : ""}`}>
              <input
                type="radio"
                name="urgencia"
                value={key}
                checked={value.urgencyMultiplier === parseFloat(key)}
                onChange={() => setUrgency(CONFIGURACION_AVANZADA.urgencia[key as "low" | "medium" | "high"].multiplier, config.label)}
              />
              <span className="radios__label">
                {key}: {config.multiplier.toFixed(2)}x ({config.label})
              </span>
            </label>
          ))}
        </div>

        {/* Slider personalizado para urgencia */}
        <input
          type="range"
          min={0.8}
          max={1.3}
          step={0.05}
          value={value.urgencyMultiplier}
          onChange={(e) => setUrgency(parseFloat(e.target.value), "Personalizado")}
          style={{ width: "100%", marginTop: "0.75rem" }}
        />

        {/* Badges por nivel */}
        <div className={`radios__badges ${status === "completed" ? "radios__badges-completed" : ""}`}>
          {value.urgencyMultiplier === 0.9 ? (
            <span className="radios__badge radios__badge--low">Urgencia Baja</span>
          ) : value.urgencyMultiplier === 1.25 ? (
            <span className="radios__badge radios__badge--high">Urgencia Alta</span>
          ) : (
            <span className="radios__badge radios__badge--medium">Urgencia Media</span>
          )}
        </div>
      </fieldset>

      {/* Contingencia Slider */}
      <fieldset>
        <legend>Contingencia Comercial</legend>
        
        <label className={`quick-quote__field`}>
          {getContingenceSliderValue()}%
        </label>
        
        <input
          type="range"
          min={0}
          max={25}
          step={1}
          value={getContingenceSliderValue()}
          onChange={(e) => setContingencePct(Number(e.target.value))}
          style={{ width: "100%", marginTop: "0.5rem" }}
        />

        {/* Slider labels */}
        <div className={`radios__badges`} style={{ display: "none", marginTop: "0.5rem" }}>
          {getContingenceSliderValue() <= 10 && 
            <span className="radios__badge radios__badge--low">Baja ({getContingenceSliderValue()}%{<})` : ""}
        </fieldset>

      {/* Margen Slider */}
      <fieldset>
        <legend>Margen de Ganancia</legend>
        
        <label className={`quick-quote__field`}>
          {getMarginSliderValue()}% - 40%
        </label>
        
        <input
          type="range"
          min={15}
          max={40}
          step={1}
          value={getMarginSliderValue()}
          onChange={(e) => setMarginPct(Number(e.target.value))}
          style={{ width: "100%", marginTop: "0.5rem" }}
        />
      </fieldset>

      {/* Descuento Slider */}
      <fieldset>
        <legend>Descuento Comercial</legend>
        
        <label className={`quick-quote__field`}>
          {getDiscountSliderValue()}% - 20%
        </label>
        
        <input
          type="range"
          min={0}
          max={20}
          step={1}
          value={getDiscountSliderValue()}
          onChange={(e) => setDiscountPct(Number(e.target.value))}
          style={{ width: "100%", marginTop: "0.5rem" }}
        />

        {/* Slider labels */}
        <div className={`radios__badges radios__badges--discount`} style={{ display: "none", marginTop: "0.5rem" }}>
          {getDiscountSliderValue() <= 5 && 
            <span className="radios__badge">0%-10%</span>
          }
        </div>
      </fieldset>

      {/* IVA Toggle */}
      <fieldset>
        <legend>IVA en Cotización</legend>
        
        <label className={`quick-quote__field`}>
          {value.apply_vat ? `Activado (${(value.vat_pct || defaultVatPct * 100).toFixed(0)}%)` : "Desactivado"}
        </label>
        
        <input
          type="checkbox"
          checked={value.apply_vat}
          onChange={() => setApplyVat(!value.apply_vat)}
          style={{ marginTop: "0.5rem" }}
        />

        {/* Slider labels */}
        <div className={`radios__badges radios__badges--vat`} style={{ display: "none", marginTop: "0.5rem" }}>
          {value.apply_vat ? (
            <>
              <span className="radios__badge radios__badge--yes">IVA activado</span>
            </>
          ) : (
            <span className="radios__badge radios__badge--no">IVA: -</span>
          )}
        </div>
      </fieldset>

      {/* Servicios Mensuales Selectables */}
      <fieldset style={{ marginTop: "2rem" }}>
        <legend>Servicios Mensuales Opcionales</legend>
        
        {!serviciosMensuales.length ? (
          <p className="quick-quote__field">No hay servicios mensuales disponibles.</p>
        ) : (
          <div className={`avanzada__mensuales-list ${status === "completed" ? "avanzada__mensuales-completed" : ""}`} style={{ marginTop: "1rem" }}>
            {serviciosMensuales.map((service) => (
              <label 
                key={service.service_id} 
                className={`avanzada__mensual-item ${service.include === "yes" ? "avanzada__mensual--selected" : ""}`}
                style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1rem", marginBottom: "0.5rem", borderRadius: "8px", border: "1px solid #e0e0e0" }}
              >
                <div style={{ flex: 1 }}>
                  <span style={{ fontWeight: 600 }}>{service.service_name}: {service.plan_name}</span>
                  <small style={{ color: "#666" }}>{service.hours_included}h/mes - {service.sla}</small>
                </div>
                <div>
                  <strong>${(service.monthly_value / 1000).toFixed(1)}k</strong>
                </div>
                <input
                  type="checkbox"
                  checked={service.include === "yes"}
                  onChange={() => toggleServicio(service.service_id, service.include)}
                  style={{ marginLeft: "1rem", width: "22px", height: "22px", cursor: "pointer" }}
                />
              </label>
            ))}
          </div>
        )}

        <div className="quick-quote__total-mensual" style={{ marginTop: "0.75rem", fontWeight: 700 }}>
          Total Mensual: ${(totalMensual / 1000).toFixed(1)}k
        </div>
      </fieldset>

      {/* Footer */}
      <footer className="avanzada__step-footer" style={{display: "flex", flexDirection: "column", gap: "1rem", justifyContent: "space-between"}}>
        {getFactorPreview()}

        <button type="submit" className="quick-quote__submit" disabled={status === "validating"}>
          {status === "active" ? "Siguiente" : status === "completed" ? "✓ Completado" : `Corregí`}
        </button>
      </footer>
    </form>
  );
}

export default AvanzadaAjustes;
