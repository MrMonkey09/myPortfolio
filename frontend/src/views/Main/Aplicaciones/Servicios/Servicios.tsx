import { useState, type FormEvent } from "react";
import Encabezado from "@utilities/Elementos/Encabezado/Encabezado";
import { simulateQuickQuote } from "@utilities/api";
import Configuracion from "./Configuracion";
import { useContactoNavegacion } from "../../ContactoNavegacionContext";
import ServiciosAvanzada from "./Avanzada/Avanzada.tsx";
import "./Estilos.css";
import type { QuoteHandoffContext, QuoteSimulateResponse } from "../../../../types";
import { trackQuickStarted, trackQuickCalculated, trackContactSubmitted, trackAdvancedModeSwitch } from "@/hooks/useAnalytics";

const QUICK_SCHEMA_VERSION = "1.0.0";
const QUICK_PROJECT_TYPE = "website";
const QUICK_PROJECT_STATE = "new";
const QUICK_CURRENCY = "CLP";
const QUICK_DISCLAIMER =
  "La cotización final se confirma tras validar requerimientos.";

type QuickStatus = "idle" | "validating" | "loading" | "error" | "success";

type QuickForm = {
  pagesEstimate: string;
  needsEcommerce: "yes" | "no";
  urgency: "low" | "medium" | "high";
};

type UiMessage = {
  tone: "info" | "warning" | "error";
  text: string;
};

function toCurrencyCLP(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

function buildLineItemFromQuickAnswers(form: QuickForm) {
  const pages = Number(form.pagesEstimate);
  const urgencyMultiplier = form.urgency === "high" ? 1.25 : form.urgency === "medium" ? 1.1 : 1;
  const ecommerceMultiplier = form.needsEcommerce === "yes" ? 1.45 : 1;
  const baseCost = Math.round(65000 * urgencyMultiplier * ecommerceMultiplier);

  return {
    include: "yes" as const,
    quantity: pages,
    complexity: form.urgency,
    base_cost: baseCost,
  };
}

function Servicios() {
  const {
    irAContactoConServicio,
    irAContactoConContexto,
    prepararHandoffAvanzada,
    avanzadaHandoffContext,
    limpiarHandoffAvanzada,
  } = useContactoNavegacion();
  const { servicios } = Configuracion.contenido;
  const [categoriaActiva, setCategoriaActiva] = useState(0);
  const [quickForm, setQuickForm] = useState<QuickForm>({
    pagesEstimate: "",
    needsEcommerce: "no",
    urgency: "medium",
  });
  const [quickStatus, setQuickStatus] = useState<QuickStatus>("idle");
  const [quickMessage, setQuickMessage] = useState<UiMessage>({
    tone: "info",
    text: "Esta simulación es referencial y puede cambiar al validar alcance final.",
  });
  const [quoteResult, setQuoteResult] = useState<QuoteSimulateResponse | null>(null);
  const [modoCotizador, setModoCotizador] = useState<"rapido" | "avanzado">("rapido");
  const cat = servicios[categoriaActiva];

  function buildQuoteHandoffContext(
    response: QuoteSimulateResponse,
    source: "quick" | "advanced",
    isStale: boolean,
    quickAnswers?: QuoteHandoffContext["quick_answers"],
  ): QuoteHandoffContext {
    return {
      source,
      quote_ref: {
        quote_id: response.quote.quote_id,
        origin: source,
        total_project: response.totals.total_project,
        total_monthly: Math.max(0, Math.round(response.totals.total_project / 12)),
      },
      context: {
        project_type: QUICK_PROJECT_TYPE,
        project_state: QUICK_PROJECT_STATE,
        currency: QUICK_CURRENCY,
        schema_version: response.meta.schema_version,
        pricing_config_version: response.meta.pricing_config_version,
        trace_id: response.meta.trace_id,
        confidence_level: response.totals.confidence_level,
        is_stale: isStale,
      },
      quick_answers: quickAnswers,
    };
  }

  function onQuickFieldChange<K extends keyof QuickForm>(field: K, value: QuickForm[K]) {
    setQuickForm((prev) => ({ ...prev, [field]: value }));

    if (quoteResult && quickStatus === "success") {
      setIsQuickResultStale(true);
      setQuickMessage({
        tone: "warning",
        text: "El resumen quedó desactualizado por cambios recientes. Recalculá para continuar con datos al día.",
      });
    }

    if (quickStatus === "error") {
      setQuickStatus("idle");
      setQuickMessage({
        tone: "info",
        text: "Completá los datos y recalculá para obtener una referencia actualizada.",
      });
    }
  }

  function validateQuickForm():
    | { ok: true; pages: number; warning?: UiMessage }
    | { ok: false; message: UiMessage } {
    const pages = Number(quickForm.pagesEstimate);

    if (!Number.isFinite(pages) || pages <= 0) {
      return {
        ok: false,
        message: {
          tone: "error",
          text: "Para continuar, completá los campos obligatorios del paso y corregí los errores marcados.",
        },
      };
    }

    if (!Number.isInteger(pages)) {
      return {
        ok: true,
        pages: Math.round(pages),
        warning: {
          tone: "warning",
          text: "Podés continuar, pero redondeamos páginas estimadas para mantener consistencia del cálculo.",
        },
      };
    }

    return { ok: true, pages };
  }

  async function handleQuickSimulate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuickStatus("validating");
    
    // Track cuando el usuario inicia la simulación rápida
    trackQuickStarted();

    const validation = validateQuickForm();
    if (!validation.ok) {
      setQuickStatus(validation.message.tone === "warning" ? "idle" : "error");
      setQuickMessage(validation.message);
      return;
    }

    if (validation.warning) {
      setQuickMessage(validation.warning);
    }

    setQuickStatus("loading");
    setQuickMessage({
      tone: "info",
      text: "Calculando rango referencial...",
    });

    try {
      // origin="quick" porque este es el flujo de cotización rápida.
      // origin="advanced" se usa cuando el usuario refine en la pantalla avanzada.
      // origin="direct_contact" viene del flujo legacy y no pasa por simulate.
      const response = await simulateQuickQuote({
        context: {
          schema_version: QUICK_SCHEMA_VERSION,
          origin: "quick",
          project_type: QUICK_PROJECT_TYPE,
          project_state: QUICK_PROJECT_STATE,
          currency: QUICK_CURRENCY,
        },
        input: {
          quick_answers: {
            pages_estimate: validation.pages,
            needs_ecommerce: quickForm.needsEcommerce,
            urgency: quickForm.urgency,
          },
          line_items: [buildLineItemFromQuickAnswers(quickForm)],
        },
      });

      // Mapear respuesta API a QuickResult para tracking
      const result: {
        success: boolean;
        total_min?: number;
        total_max?: number;
        confidence_level?: "low" | "medium" | "high";
        error_message?: string;
      } = {
        success: true,
        total_min: response.totals.estimated_min,
        total_max: response.totals.estimated_max,
        confidence_level: response.totals.confidence_level,
      };
      
      // Track cuando la API responde con éxito
      trackQuickCalculated(result);

      setQuoteResult(response);
      setIsQuickResultStale(false);
      limpiarHandoffAvanzada();
      setQuickStatus("success");
      setQuickMessage({
        tone: "info",
        text: "Simulación lista. Revisá el rango estimado y, si querés, refinamos en la versión avanzada.",
      });
    } catch (error) {
      const errorResult: {
        success: boolean;
        total_min?: number;
        total_max?: number;
        confidence_level?: "low" | "medium" | "high";
        error_message?: string;
      } = {
        success: false,
        error_message: error instanceof Error ? error.message : undefined,
      };
      
      // Track cuando la API devuelve error
      trackQuickCalculated(errorResult);

      setQuickStatus("error");
      setQuickMessage({
        tone: "error",
        text:
          error instanceof Error
            ? error.message
            : "No pudimos calcular la cotización ahora. Intentá nuevamente en unos segundos.",
      });
    }
  }

  function handleRefinarAvanzada() {
    if (!quoteResult) {
      setQuickMessage({
        tone: "error",
        text: "Primero calculá una cotización rápida para poder refinar en la avanzada.",
      });
      return;
    }

    // Track cambio a modo avanzado desde Quick Flow
    trackAdvancedModeSwitch();

    const contexto = buildQuoteHandoffContext(quoteResult, "quick", isQuickResultStale, {
      pages_estimate: Number(quickForm.pagesEstimate || 0),
      needs_ecommerce: quickForm.needsEcommerce,
      urgency: quickForm.urgency,
    });

    prepararHandoffAvanzada(contexto);

    setQuickMessage({
      tone: "warning",
      text: isQuickResultStale
        ? "Contexto enviado a avanzada, pero está desactualizado. Cuando avancemos con la pantalla avanzada, pediremos recalcular antes de confirmar resumen."
        : "Contexto enviado a avanzada. La pantalla avanzada completa se habilita en Sprint 1 P2 y ya queda pre-cargada para continuar.",
    });
    
    setModoCotizador("avanzado");
  }

  function handleContactarAhora() {
    if (!quoteResult) {
      irAContactoConServicio("Cotización rápida — seguimiento comercial");
      return;
    }

    const total = quoteResult.totals.total_project;

    const contexto = buildQuoteHandoffContext(quoteResult, "quick", isQuickResultStale, {
      pages_estimate: Number(quickForm.pagesEstimate || 0),
      needs_ecommerce: quickForm.needsEcommerce,
      urgency: quickForm.urgency,
    });

    // Track contacto desde Quick Flow con el total calculado
    trackContactSubmitted("quick", total);

    irAContactoConContexto("Cotización rápida — seguimiento comercial", contexto);
  }

  return (
    <>
      <Encabezado encabezado={Configuracion.contenido.encabezado} />
      <section className="servicios-section section-fade-in">
        {/* Navigation pills */}
        <nav
          className="servicios-nav mask-horizontal"
          aria-label="Categorías de servicios"
        >
          {servicios.map((cat, idx) => (
            <button
              key={cat.id}
              className={`servicios-nav-pill ${idx === categoriaActiva ? "servicios-nav-pill--active" : ""}`}
              onClick={() => setCategoriaActiva(idx)}
              type="button"
              title={cat.titulo}
              aria-current={idx === categoriaActiva ? "true" : undefined}
            >
              <span className="servicios-nav-pill__icon">{cat.icono}</span>
              <span className="servicios-nav-pill__text">{cat.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Active category content */}
        <div className="servicios-content">
          <header className="servicios-content__header">
            <h3 className="servicios-content__title">
              {cat.icono} {cat.titulo}
            </h3>
            <p className="servicios-content__subtitle">{cat.subtitulo}</p>
          </header>

          <div className="servicios-planes-grid">
            {cat.planes.map((plan, idx) => (
              <article
                key={`${cat.id}-${idx}`}
                className={`servicio-plan-card ${plan.destacado ? "servicio-plan-card--destacado" : ""}`}
              >
                {plan.etiqueta && (
                  <span className="servicio-plan-card__badge">
                    {plan.etiqueta}
                  </span>
                )}
                <h4 className="servicio-plan-card__nombre">{plan.nombre}</h4>
                <p className="servicio-plan-card__precio">{plan.precio}</p>
                <ul className="servicio-plan-card__features">
                  {plan.caracteristicas.map((feat, i) => (
                    <li key={i} className="servicio-plan-card__feature">
                      <span className="servicio-plan-card__check">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="servicio-plan-card__cta"
                  onClick={() =>
                    irAContactoConServicio(`${cat.titulo} — ${plan.nombre}`)
                  }
                >
                  Consultar este plan
                </button>
              </article>
            ))}
          </div>

          <section className="cotizador-wrapper">
            <div className="cotizador-modo-toggle">
              <button
                type="button"
                className={`cotizador-toggle-btn ${modoCotizador === "rapido" ? "active" : ""}`}
                onClick={() => setModoCotizador("rapido")}
              >
                Cotizador Rápido
              </button>
              <button
                type="button"
                className={`cotizador-toggle-btn ${modoCotizador === "avanzado" ? "active" : ""}`}
                onClick={() => setModoCotizador("avanzado")}
              >
                Cotizador Avanzado
              </button>
            </div>

            {modoCotizador === "rapido" && (
              <div className="quick-quote" aria-labelledby="quick-quote-title">
                <header className="quick-quote__header">
                  <h4 id="quick-quote-title">Cotización rápida (referencial)</h4>
                  <p>
                    Completá lo mínimo y te devuelvo rango estimado, total calculado y nivel
                    de confianza.
                  </p>
                </header>

                <form className="quick-quote__form" onSubmit={handleQuickSimulate} noValidate>
                  <label className="quick-quote__field" htmlFor="pages_estimate">
                    <span>Páginas estimadas *</span>
                    <input
                      id="pages_estimate"
                      name="pages_estimate"
                      type="number"
                      min={1}
                      step={1}
                      value={quickForm.pagesEstimate}
                      onChange={(e) => onQuickFieldChange("pagesEstimate", e.target.value)}
                      aria-invalid={quickStatus === "error" && Number(quickForm.pagesEstimate) <= 0}
                      required
                    />
                  </label>

                  <label className="quick-quote__field" htmlFor="needs_ecommerce">
                    <span>¿Necesitás e-commerce? *</span>
                    <select
                      id="needs_ecommerce"
                      name="needs_ecommerce"
                      value={quickForm.needsEcommerce}
                      onChange={(e) =>
                        onQuickFieldChange("needsEcommerce", e.target.value as "yes" | "no")
                      }
                    >
                      <option value="no">No</option>
                      <option value="yes">Sí</option>
                    </select>
                  </label>

                  <label className="quick-quote__field" htmlFor="urgency">
                    <span>Urgencia *</span>
                    <select
                      id="urgency"
                      name="urgency"
                      value={quickForm.urgency}
                      onChange={(e) =>
                        onQuickFieldChange("urgency", e.target.value as "low" | "medium" | "high")
                      }
                    >
                      <option value="low">Baja</option>
                      <option value="medium">Media</option>
                      <option value="high">Alta</option>
                    </select>
                  </label>

                  <button
                    type="submit"
                    className="quick-quote__submit"
                    disabled={quickStatus === "loading" || quickStatus === "validating"}
                  >
                    {quickStatus === "loading" ? "Calculando..." : "Calcular cotización rápida"}
                  </button>
                </form>

                <div className={`quick-quote__message quick-quote__message--${quickMessage.tone}`}>
                  {quickMessage.text}
                </div>

                {quoteResult && quickStatus === "success" && (
                  <article className="quick-quote-result" aria-live="polite">
                    <h5>Resultado referencial</h5>
                    <div className="quick-quote-result__grid">
                      <p>
                        <span>Rango estimado</span>
                        <strong>
                          {toCurrencyCLP(quoteResult.totals.estimated_min)} - {" "}
                          {toCurrencyCLP(quoteResult.totals.estimated_max)}
                        </strong>
                      </p>
                      <p>
                        <span>Total calculado</span>
                        <strong>{toCurrencyCLP(quoteResult.totals.total_project)}</strong>
                      </p>
                      <p>
                        <span>Confianza</span>
                        <strong>{quoteResult.totals.confidence_level}</strong>
                      </p>
                    </div>

                    <p className="quick-quote-result__disclaimer">
                      {quoteResult.totals.disclaimer || quoteResult.quote.disclaimer || QUICK_DISCLAIMER}
                    </p>

                    {isQuickResultStale && (
                      <p className="quick-quote-result__stale" role="status">
                        Este resumen está desactualizado por cambios en los inputs. Recalculá para actualizar el handoff.
                      </p>
                    )}

                    <div className="quick-quote-result__cta">
                      <button type="button" onClick={handleRefinarAvanzada}>
                        Refinar en cotización avanzada
                      </button>
                      <button type="button" onClick={handleContactarAhora}>
                        Contactar ahora
                      </button>
                    </div>
                  </article>
                )}
              </div>
            )}

            {modoCotizador === "avanzado" && (
              <ServiciosAvanzada />
            )}
          </section>
        </div>
      </section>
    </>
  );
}

export default Servicios;
