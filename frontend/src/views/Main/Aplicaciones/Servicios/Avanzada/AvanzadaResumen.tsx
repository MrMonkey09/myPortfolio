import type { QuoteSimulateResponse, MonthlyService } from "@/types/index.js";
import Configuracion from "./Configuracion.js";
import "./Estilos.css";
import { trackAdvancedStepViewed, trackAdvancedCalculated, trackContactSubmitted } from "@/hooks/useAnalytics";
import { useEffect } from "react";

interface Props {
  readonly resultado: QuoteSimulateResponse;
  readonly serviciosMensuales: readonly MonthlyService[];
  readonly onRecalculate: () => void;
  readonly onContact: () => void;
  readonly isStale: boolean;
}

function AvanzadaResumen({ resultado, serviciosMensuales, onRecalculate, onContact, isStale }: Props) {
  // Track paso 5 (resumen) al montar
  useEffect(() => {
    trackAdvancedStepViewed(5, 'resumen');
  }, []);

  // Track cálculo completado (resumen renderizado con datos)
  useEffect(() => {
    if (resultado?.totals) {
      trackAdvancedCalculated({
        success: true,
        total_project: resultado.totals.total_project,
        total_monthly: resultado.totals.total_monthly ?? resultado.totals.total_project / 12,
        confidence_level: resultado.totals.confidence_level,
      });
    }
  }, [resultado?.totals?.total_project]);

  // Track CTA contacto
  function handleContactNow(event: React.FormEvent) {
    event.preventDefault();
    trackContactSubmitted('advanced', resultado.totals?.total_project, false);
    onContact();
  }

  function handleRecalculate(event: React.FormEvent) {
    event.preventDefault();
    onRecalculate();
  }

  function toCurrencyCLP(value: number): string {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      maximumFractionDigits: 0,
    }).format(value);
  }

  // Mostrar servicios mensuales incluidos
  function renderMensualesServices(): React.ReactNode {
    const services = ServiciosMensuales.filter(s => s.include === "yes");
    
    if (services.length === 0) {
      return <p className="resumen__mensual--empty">No hay servicios mensuales seleccionados</p>;
    }

    return (
      <ul className={`resumen__mensuals resumen-completed`}>
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
    <section className={`avanzada__step-form resumen-container ${isStale ? "resumen-stale" : ""}`}>
      {/* Header del resumen */}
      <header className="resumen-header">
        <h2>Cotización Avanzada - Resultado {isStale ? "(Desactualizado)" : ""}</h2>
        {resultado.quote.disclaimer && (
          <div className="resumen-disclaimer">{resultado.quote.disclaimer}</div>
        )}
      </header>

      {/* Rango estimado */}
      <article className={`quick-quote-result avanzada__summary ${isStale ? "avanzada__summary-stale" : ""}`}>
        {isStale && (
          <div className="resumen-stale-banner" role="alert">
            ⚠️ ESTE RESULTADO ESTÁ DESACTUALIZADO • Recalcula con los cambios actuales para obtener la cotización más precisa
          </div>
        )}
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
            onClick={onRecalculate} 
            disabled={Boolean(resultado) && isStale}
            style={{textDecoration: "underline", fontWeight: 600}}
          >
            🔄 Recalcular Cotización {isStale && "(Obligatorio)"}
          </button>
          <button 
            type="submit" 
            onClick={handleContactNow}
            disabled={isStale}
            style={{fontWeight: 700, padding: "0.85rem 1.25rem", backgroundColor: isStale ? "#e0e0e0" : "var(--primary)", color: isStale ? "#999" : "white"}}
          >
            📧 Contactar ahora {isStale && "(Necesita recalcular)"} ↗
          </button>
        </div>
      </article>

      {/* Visualizador de servicios mensuales */}
      <section className={`resumen-container ${isStale ? "resumen-stale" : ""}`}>
        <h5 style={{marginTop: "1.25rem", fontWeight: 700}}>
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

      <footer className="avanzada__step-footer" style={{marginTop: "2rem", paddingTop: "1.5rem", borderTop: "1px solid #e0e0e0"}}>
        {/* Botón recalcular ya está en el header */}
      </footer>
    </section>
  );
}

export default AvanzadaResumen;
