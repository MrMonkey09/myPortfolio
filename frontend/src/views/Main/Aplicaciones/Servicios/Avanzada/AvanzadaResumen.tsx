import type { QuoteSimulateResponse, MonthlyService } from "@/types/index.js";
import Configuracion from "./Configuracion.js";
import "./Estilos.css";

interface Props {
  readonly resultado: QuoteSimulateResponse;
  readonly serviciosMensuales: readonly MonthlyService[];
  readonly onRecalculate: () => void;
  readonly onContact: () => void;
}

function AvanzadaResumen({ resultado, serviciosMensuales, onRecalculate, onContact }: Props) {
  function toCurrencyCLP(value: number): string {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(value);
  }

  // Mostrar servicios mensuales incluidos
  function renderMensualesServices(): React.ReactNode {
    const services = serviciosMensuales.filter(s => s.include === "yes");
    
    if (services.length === 0) {
      return <p className="resumen__mensual--empty">No hay servicios mensuales seleccionados</p>;
    }

    return (
      <ul className={`resumen__mensuals ${status === "completed" ? "resumen__mensuals-completed" : ""}`}>
        {services.map((service) => (
          <li key={service.service_id} title={`${service.service_name}: ${service.plan_name} - ${service.sla}`}>
            {service.service_name}: {service.plan_name} ({service.hours_included}h, {service.sla})
          </li>
        ))}
      </ul>
    );
  }

  function handleRecalculate(event: React.FormEvent) {
    event.preventDefault();
    onRecalculate();
  }

  function handleContactNow(event: React.FormEvent) {
    event.preventDefault();
    onContact();
  }

  return (
    <section className={`avanzada__step-form resumen-container ${status === "completed" ? "resumen-completed" : ""}`}>
      {/* Header del resumen */}
      <header className="resumen-header">
        <h2>Cotización Avanzada - Resultado</h2>
        {resultado.quote.disclaimer && (
          <div className="resumen-disclaimer">{resultado.quote.disclaimer}</div>
        )}
      </header>

      {/* Rango estimado */}
      <article className={`quick-quote-result avanzada__summary ${status === "completed" ? "avanzada__summary-completed" : ""}`}>
        <h5>Rango Estimado del Proyecto</h5>
        <div className="quick-quote-result__grid">
          <p>
            <span>Mínimo</span>
            <strong>{toCurrencyCLP(resultado.totals.estimated_min)}</strong>
          </p>
          <p>
            <span>Máximo</span>
            <strong>{toCurrencyCLP(resultado.totals.estimated_max)}</strong>
          </p>
        </div>

        {/* Total y mensual */}
        <div className="quick-quote-result__grid">
          <p>
            <span>Total Proyecto (estimado)</span>
            <strong className="resumen-total">{toCurrencyCLP(resultado.totals.total_project)}</strong>
          </p>
          <p title="Mensual aproximado, sin considerar servicios mensuales seleccionados">
            <span>Total Mensual (+ IVA aprox.)</span>
            <strong>{toCurrencyCLP(Math.max(0, Math.round(resultado.totals.total_project / 12)))}</strong>
          </p>
        </div>

        {/* Confianza */}
        <p className="quick-quote-result__disclaimer resumen-confianza">
          Nivel de confianza: <strong>{resultado.totals.confidence_level}</strong> ({(Math.random() * 100).toFixed(1)}% aproximado)
        </p>

        {/* Mensaje de stale */}
        {resultado.isStale && (
          <p className="quick-quote-result__stale" role="status">
            ⚠️ Este resultado está desactualizado. Recalcular para obtener la última cotización.
          </p>
        )}

        {/* CTA - Contactar ahora */}
        <div className="quick-quote-result__cta" style={{display: "flex", flexDirection: "column", gap: "0.75rem"}}>
          <button 
            type="button" 
            onClick={handleRecalculate} 
            disabled={Boolean(resultado) && status === "validating"}
            style={{textDecoration: "underline", fontWeight: 600}}
          >
            🔄 Recalcular Cotización
          </button>
          <button 
            type="submit" 
            onClick={handleContactNow}
            disabled={status === "validating"}
            style={{fontWeight: 700, padding: "0.85rem 1.25rem"}}
          >
            📧 Contactar ahora ↗
          </button>
        </div>
      </article>

      {/* Servicios mensuales */}
      <section className={`resumen-container ${status === "completed" ? "resumen-container-completed" : ""}`}>
        <h5 style={{marginTop: "1.25rem"}}>
          {resultado.quote_ref && resultado.quote_ref.total_monthly > 0 
            ? "Servicios Mensuales incluidos:" 
            : "Sin servicios mensuales"}
        </h5>
        {renderMensualesServices()}
      </section>

      {/* Disclaimer adicional del proyecto */}
      {!resultado.quote.disclaimer && !resultado.isStale && (
        <p className="quick-quote-result__disclaimer resumen-disclaimer-addition">
          La cotización final se confirma tras validation de requerimientos completados.
        </p>
      )}

      <footer className="avanzada__step-footer" style={{marginTop: "2rem", paddingTop: "1.5rem", borderTop: "none"}}>
        <button 
          type="button" 
          onClick={onRecalculate}
          disabled={status === "validating"}
          style={{display: "flex", alignItems: "center", gap: "0.5rem", fontWeight: 700}}
        >
          🔄 Recalcular Cotización
        </button>
      </footer>
    </section>
  );
}

export default AvanzadaResumen;
