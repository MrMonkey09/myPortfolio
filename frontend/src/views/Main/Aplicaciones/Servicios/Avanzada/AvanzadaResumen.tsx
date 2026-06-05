import type { QuoteSimulateResponse, MonthlyService } from "@/types/index.js";
import { trackAdvancedStepViewed, trackAdvancedCalculated, trackContactSubmitted } from "@/hooks/useAnalytics";
import { useEffect } from "react";
import "./Estilos.css";

interface Props {
  readonly resultado: QuoteSimulateResponse;
  readonly serviciosMensuales: readonly MonthlyService[];
  readonly onRecalculate: () => void;
  readonly showContactForm: boolean;
  readonly contactForm: {
    nombre: string;
    email: string;
    telefono: string;
    redSocial: string;
  };
  readonly onContactFieldChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  readonly onContactClick: () => void;
  readonly onFinalSubmit: (e: React.FormEvent) => void;
  readonly isSaving: boolean;
  readonly saveSuccess: boolean;
  readonly isStale: boolean;
}

function AvanzadaResumen({ 
  resultado, 
  serviciosMensuales, 
  onRecalculate, 
  showContactForm,
  contactForm,
  onContactFieldChange,
  onContactClick,
  onFinalSubmit,
  isSaving,
  saveSuccess,
  isStale 
}: Props) {
  useEffect(() => {
    trackAdvancedStepViewed(5, 'resumen');
  }, []);

  useEffect(() => {
    if (resultado?.totals) {
      trackAdvancedCalculated({
        success: true,
        total_project: resultado.totals.total_project,
        total_monthly: resultado.totals.total_monthly,
        confidence_level: resultado.totals.confidence_level,
      });
    }
  }, [resultado?.totals?.total_project]);

  function toCurrencyCLP(value: number): string {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(value);
  }

  const monthlyServices = serviciosMensuales.filter(s => s.include === "yes");
  const projectModules: any[] = resultado.breakdown || [];
  const totals = resultado.totals as any;

  // Usar valores calculados por el backend cuando están disponibles.
  // computed_unit_cost y direct_cost los agrega buildTotals() (Node y PHP).
  function calcUnitCost(m: any): number {
    if (m.computed_unit_cost != null && m.computed_unit_cost > 0) return m.computed_unit_cost;
    return m.base_cost > 0 ? m.base_cost : (m.unit_hours || 0) * 18000;
  }

  function calcSubtotal(m: any): number {
    if (m.direct_cost != null && m.direct_cost > 0) return m.direct_cost;
    return calcUnitCost(m) * (m.quantity || 1);
  }

  return (
    <section className={`avanzada__step-form resumen-container ${isStale ? "resumen-stale" : ""}`}>
      <header className="resumen-header">
        <h3 style={{ color: "var(--accent-blue)" }}>Tu Propuesta Personalizada</h3>
        <p>Aquí tienes el desglose técnico y comercial de tu inversión estimada.</p>
      </header>

      {isStale && (
        <div className="resumen-stale-banner" style={{ background: "#ff4b2b", color: "white", padding: "0.75rem", borderRadius: "8px", marginBottom: "1rem", fontSize: "0.9rem", textAlign: "center" }}>
          ⚠️ Los cambios recientes requieren un nuevo cálculo.
        </div>
      )}

      {/* Grid de Totales */}
      <div className="resumen-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1.5rem", marginTop: "1rem" }}>
        <article style={{ background: "rgba(255,255,255,0.03)", padding: "1.5rem", borderRadius: "16px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h4 style={{ margin: "0 0 1rem 0", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--text-secondary)" }}>Inversión del Proyecto</h4>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--text-primary)" }}>{toCurrencyCLP(resultado.totals.total_project)}</div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginTop: "0.5rem" }}>Rango: {toCurrencyCLP(resultado.totals.estimated_min)} - {toCurrencyCLP(resultado.totals.estimated_max)}</p>
        </article>

        <article style={{ background: "rgba(0,255,65,0.03)", padding: "1.5rem", borderRadius: "16px", border: "1px solid rgba(0,255,65,0.2)" }}>
          <h4 style={{ margin: "0 0 1rem 0", fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "1px", color: "var(--accent-blue)" }}>Acompañamiento Mensual</h4>
          <div style={{ fontSize: "2rem", fontWeight: "bold", color: "var(--accent-blue)" }}>{toCurrencyCLP(resultado.totals.total_monthly)}</div>
          <p style={{ fontSize: "0.8rem", color: "var(--text-tertiary)", marginTop: "0.5rem" }}>Mantenimiento y soporte profesional.</p>
        </article>
      </div>

      {/* Tabla de Costos por Módulo */}
      {projectModules.length > 0 && (
        <div className="resumen-details" style={{ marginTop: "2rem", padding: "1.5rem", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <h4 style={{ margin: "0 0 1rem 0", fontSize: "1rem", color: "var(--text-secondary)" }}>Desglose por Módulo</h4>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", color: "var(--text-tertiary)", textTransform: "uppercase", fontSize: "0.7rem", letterSpacing: "0.5px" }}>
                  <th style={{ textAlign: "left", padding: "0.5rem 0.75rem" }}>Módulo</th>
                  <th style={{ textAlign: "center", padding: "0.5rem 0.75rem" }}>Cant.</th>
                  <th style={{ textAlign: "right", padding: "0.5rem 0.75rem" }}>Costo Unit.</th>
                  <th style={{ textAlign: "right", padding: "0.5rem 0.75rem" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {projectModules.map((m: any, idx: number) => (
                  <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td style={{ padding: "0.75rem", color: "var(--text-primary)", fontWeight: "500" }}>
                      {m.module_name}
                      <span style={{ display: "block", fontSize: "0.7rem", color: "var(--text-tertiary)", marginTop: "0.15rem" }}>
                        {m.complexity === "low" ? "Baja" : m.complexity === "high" ? "Alta" : "Media"} complejidad
                      </span>
                    </td>
                    <td style={{ textAlign: "center", padding: "0.75rem", color: "var(--text-secondary)" }}>{m.quantity}</td>
                    <td style={{ textAlign: "right", padding: "0.75rem", color: "var(--text-secondary)" }}>{toCurrencyCLP(calcUnitCost(m))}</td>
                    <td style={{ textAlign: "right", padding: "0.75rem", color: "var(--text-primary)", fontWeight: "600" }}>{toCurrencyCLP(calcSubtotal(m))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Servicios Mensuales */}
      {monthlyServices.length > 0 && (
        <div className="resumen-details" style={{ marginTop: "1.5rem", padding: "1.5rem", background: "rgba(0,255,65,0.02)", borderRadius: "12px", border: "1px solid rgba(0,255,65,0.15)" }}>
          <h4 style={{ margin: "0 0 1rem 0", fontSize: "1rem", color: "var(--accent-blue)" }}>Plan de Acompañamiento Mensual</h4>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            {monthlyServices.map((s, idx) => (
              <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "8px" }}>
                <div>
                  <span style={{ fontWeight: "600", color: "var(--text-primary)" }}>Plan: {s.plan_name}</span>
                  <span style={{ display: "block", fontSize: "0.75rem", color: "var(--text-tertiary)", marginTop: "0.15rem" }}>
                    SLA: {s.sla} | {s.hours_included} horas incluidas
                  </span>
                </div>
                <span style={{ fontWeight: "700", color: "var(--accent-blue)", fontSize: "1.05rem" }}>{toCurrencyCLP(s.monthly_value)}/mes</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Desglose de Pricing */}
      {(totals.direct_cost != null || totals.contingency_value != null) && (
        <div className="resumen-details" style={{ marginTop: "1.5rem", padding: "1.5rem", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
          <h4 style={{ margin: "0 0 1rem 0", fontSize: "1rem", color: "var(--text-secondary)" }}>Estructura de Costos</h4>
          <div style={{ display: "grid", gap: "0.5rem", fontSize: "0.85rem" }}>
            {totals.direct_cost != null && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <span style={{ color: "var(--text-secondary)" }}>Costo directo (hs × tarifa)</span>
                <span style={{ color: "var(--text-primary)" }}>{toCurrencyCLP(totals.direct_cost)}</span>
              </div>
            )}
            {totals.contingency_value != null && totals.contingency_value > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <span style={{ color: "var(--text-secondary)" }}>Contingencia ({Math.round((totals.contingency_value / (totals.direct_cost || 1)) * 100)}%)</span>
                <span style={{ color: "var(--text-secondary)" }}>+ {toCurrencyCLP(totals.contingency_value)}</span>
              </div>
            )}
            {totals.margin_value != null && totals.margin_value > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <span style={{ color: "var(--text-secondary)" }}>Margen ({Math.round((totals.margin_value / (totals.subtotal_with_contingency || 1)) * 100)}%)</span>
                <span style={{ color: "var(--text-secondary)" }}>+ {toCurrencyCLP(totals.margin_value)}</span>
              </div>
            )}
            {(totals as any).discount_value != null && (totals as any).discount_value > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <span style={{ color: "#4caf50" }}>Descuento</span>
                <span style={{ color: "#4caf50" }}>- {toCurrencyCLP((totals as any).discount_value)}</span>
              </div>
            )}
            {totals.vat_value != null && totals.vat_value > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", padding: "0.4rem 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                <span style={{ color: "var(--text-secondary)" }}>IVA 19%</span>
                <span style={{ color: "var(--text-secondary)" }}>+ {toCurrencyCLP(totals.vat_value)}</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", padding: "0.75rem 0 0 0", borderTop: "2px solid rgba(255,255,255,0.15)", marginTop: "0.5rem" }}>
              <span style={{ fontWeight: "700", color: "var(--text-primary)", fontSize: "1rem" }}>Total Proyecto</span>
              <span style={{ fontWeight: "700", color: "var(--accent-blue)", fontSize: "1.1rem" }}>{toCurrencyCLP(resultado.totals.total_project)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ACCIONES FINALES Y CAPTURA DE CONTACTO */}
      <div className="resumen-cta-group" style={{ marginTop: "2.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
        {saveSuccess ? (
          <div className="resumen-success-card" style={{ padding: "2rem", background: "rgba(0,255,65,0.1)", borderRadius: "12px", border: "1px solid var(--accent-blue)", textAlign: "center", animation: "fadeIn 0.5s ease" }}>
            <h4 style={{ color: "var(--accent-blue)", margin: "0 0 0.5rem 0" }}>¡Presupuesto Registrado!</h4>
            <p style={{ fontSize: "0.95rem", color: "white" }}>
              Gracias <strong>{contactForm.nombre}</strong>. Hemos guardado tu propuesta técnica. 
              Te contactaremos a <strong>{contactForm.email}</strong> para los siguientes pasos.
            </p>
          </div>
        ) : showContactForm ? (
          <form className="quick-contact-integrated" onSubmit={onFinalSubmit}>
            <h4 style={{ color: "white", marginBottom: "1rem", textAlign: "center" }}>Confirma tus datos para registrar la propuesta</h4>
            <div className="quick-contact-integrated__fields">
              <input type="text" name="nombre" placeholder="Nombre completo" required value={contactForm.nombre} onChange={onContactFieldChange} />
              <input type="email" name="email" placeholder="Email corporativo" required value={contactForm.email} onChange={onContactFieldChange} />
              <input type="tel" name="telefono" placeholder="WhatsApp / Teléfono" value={contactForm.telefono} onChange={onContactFieldChange} />
            </div>
            <div className="quick-contact-integrated__actions">
              <button type="submit" disabled={isSaving} style={{ background: "var(--accent-blue)", color: "black" }}>
                {isSaving ? "Guardando..." : "Confirmar y Enviar Presupuesto"}
              </button>
              <button type="button" className="btn-cancel" onClick={() => onRecalculate()}>Cancelar</button>
            </div>
          </form>
        ) : (
          <>
            <button
              onClick={onContactClick}
              disabled={isStale}
              className="quick-quote__submit"
              style={{ width: "100%", padding: "1.25rem", fontSize: "1.1rem", fontWeight: "bold", background: isStale ? "#333" : "var(--accent-blue)", color: isStale ? "#666" : "black" }}
            >
              {isStale ? "Recalcula para continuar" : "Confirmar y Agendar Consultoría Gratuita ↗"}
            </button>
            <button onClick={onRecalculate} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", textDecoration: "underline", alignSelf: "center" }}>
              🔄 Ajustar funcionalidades y recalcular
            </button>
          </>
        )}
      </div>

      <p style={{ marginTop: "2rem", fontSize: "0.75rem", color: "var(--text-tertiary)", textAlign: "center" }}>
        Valores netos. Propuesta válida por 15 días.
      </p>
    </section>
  );
}

export default AvanzadaResumen;
