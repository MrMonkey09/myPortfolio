import type { AjustesComerciales, MonthlyService } from "@/types/index.js";
import { trackAdvancedStepViewed } from "@/hooks/useAnalytics";
import { useEffect } from "react";
import "./Estilos.css";

interface Props {
  readonly value: AjustesComerciales;
  readonly onChange: (ajustes: AjustesComerciales) => void;
  readonly serviciosMensuales: readonly MonthlyService[];
  readonly onChangeServicios: (servicios: MonthlyService[]) => void;
  readonly onNext: () => void;
  readonly onBack?: () => void;
  readonly status: "active" | "completed" | "invalid" | "warning";
}

function AvanzadaAjustes({ value, serviciosMensuales, onChangeServicios, onNext, onBack, status }: Props) {
  useEffect(() => {
    trackAdvancedStepViewed(4, 'ajustes');
  }, []);

  const totalMensual = serviciosMensuales.reduce((sum, s) => sum + (s.include === "yes" ? s.monthly_value : 0), 0);

  function selectPlan(serviceId: string) {
    onChangeServicios(serviciosMensuales.map(s => ({
      ...s,
      include: s.service_id === serviceId ? "yes" : "no"
    })));
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    onNext();
  }

  return (
    <form className="avanzada__step-form" onSubmit={handleSubmit} noValidate>
      <header className="modulos__header">
        <h3>Lanzamiento y Soporte</h3>
        <p>Tu web es un activo vivo. Elige cómo quieres que la cuidemos después de que esté online.</p>
      </header>

      {/* Ajustes Comerciales Internos Ocultos */}
      <div style={{ display: "none" }}>
        <input type="hidden" name="contingency_pct" value={value.contingency_pct} />
        <input type="hidden" name="margin_pct" value={value.margin_pct} />
        <input type="hidden" name="discount_pct" value={value.discount_pct} />
      </div>

      <div className="avanzada__planes-container" style={{ display: "grid", gap: "1rem", marginTop: "1rem" }}>
        {serviciosMensuales.map((service) => {
          const isSelected = service.include === "yes";
          return (
            <div
              key={service.service_id}
              onClick={() => selectPlan(service.service_id)}
              className={`avanzada__plan-card ${isSelected ? "avanzada__step-selected" : ""}`}
              style={{
                padding: "1.25rem",
                borderRadius: "12px",
                border: isSelected ? "2px solid var(--accent-blue)" : "1px solid rgba(255,255,255,0.1)",
                cursor: "pointer",
                background: isSelected ? "rgba(0, 255, 65, 0.05)" : "rgba(255,255,255,0.02)",
                transition: "all 0.3s ease",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <h4 style={{ margin: 0, color: isSelected ? "var(--accent-blue)" : "var(--text-primary)" }}>
                    {service.plan_name}
                  </h4>
                  {service.plan_name === "Profesional" && (
                    <span style={{ fontSize: "0.7rem", background: "var(--accent-blue)", color: "black", padding: "2px 6px", borderRadius: "4px", fontWeight: "bold" }}>
                      RECOMENDADO
                    </span>
                  )}
                </div>
                <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", margin: "0.5rem 0" }}>
                  {service.plan_name === "Esencial" && "Alojamiento seguro y actualizaciones críticas."}
                  {service.plan_name === "Profesional" && "Soporte activo para cambios y mejoras continuas."}
                  {service.plan_name === "Enterprise" && "Disponibilidad total y prioridad máxima en requerimientos."}
                </p>
                <div style={{ fontSize: "0.8rem", color: "var(--text-tertiary)" }}>
                  SLA: {service.sla} | {service.hours_included} horas/mes
                </div>
              </div>
              <div style={{ textAlign: "right", paddingLeft: "1rem" }}>
                <div style={{ fontSize: "1.2rem", fontWeight: "bold", color: "var(--text-primary)" }}>
                  ${(service.monthly_value / 1000).toFixed(0)}k
                </div>
                <div style={{ fontSize: "0.7rem", color: "var(--text-tertiary)" }}>CLP/mes</div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "1.5rem", padding: "1rem", background: "rgba(0,255,65,0.05)", borderRadius: "8px", textAlign: "center" }}>
        <p style={{ margin: 0, fontSize: "0.9rem" }}>
          Inversión mensual en soporte: <strong>${(totalMensual / 1000).toFixed(0)}k CLP</strong>
        </p>
      </div>

      <footer className="avanzada__step-footer" style={{ marginTop: "2rem", display: "flex", justifyContent: "space-between", gap: "1rem" }}>
        {onBack && (
          <button type="button" onClick={onBack} className="quick-quote__submit" style={{ backgroundColor: "rgba(255,255,255,0.1)", color: "white", flex: "none" }}>
            Atrás
          </button>
        )}
        <button type="submit" className="quick-quote__submit" disabled={status === "invalid"} style={{ flex: 1 }}>
          Ver Presupuesto Final
        </button>
      </footer>
    </form>
  );
}

export default AvanzadaAjustes;
