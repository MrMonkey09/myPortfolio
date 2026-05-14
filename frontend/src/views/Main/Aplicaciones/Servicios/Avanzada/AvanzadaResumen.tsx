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
  const projectModules = resultado.breakdown || [];

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

      {/* Desglose Detallado */}
      <div className="resumen-details" style={{ marginTop: "2rem", padding: "1.5rem", background: "rgba(255,255,255,0.02)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.05)" }}>
        <h4 style={{ margin: "0 0 1rem 0", fontSize: "1rem", color: "var(--text-secondary)" }}>Estructura de Inversión</h4>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "0.75rem" }}>
          {projectModules.map((m, idx) => (
            <li key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem", paddingBottom: "0.5rem", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ color: "var(--text-primary)", fontWeight: "500" }}>{m.module_name}</span>
                <span style={{ fontSize: "0.75rem", color: "var(--text-tertiary)" }}>Cant: {m.quantity} | {m.complexity}</span>
              </div>
              <span style={{ fontWeight: "600", color: "var(--text-secondary)" }}>{m.base_cost > 0 ? "Incluido" : `${m.unit_hours * m.quantity}h Est.`}</span>
            </li>
          ))}
        </ul>
      </div>

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
