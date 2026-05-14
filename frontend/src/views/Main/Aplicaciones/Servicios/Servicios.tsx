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
  projectType: "landing" | "corporate" | "catalog" | "ecommerce" | "custom" | "";
  contentReady: "yes" | "no" | "partial";
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
  let baseCost = 0;
  let pages = 1;

  switch (form.projectType) {
    case "landing": baseCost = 215000; pages = 1; break;
    case "corporate": baseCost = 575000; pages = 5; break;
    case "catalog": baseCost = 860000; pages = 10; break;
    case "ecommerce": baseCost = 1075000; pages = 15; break;
    case "custom": baseCost = 2500000; pages = 20; break;
    default: baseCost = 575000; pages = 3; break;
  }

  const contentMultiplier = form.contentReady === "no" ? 1.2 : form.contentReady === "partial" ? 1.1 : 1;
  const urgencyMultiplier = form.urgency === "high" ? 1.25 : form.urgency === "low" ? 0.9 : 1;
  const finalCost = Math.round(baseCost * contentMultiplier * urgencyMultiplier);

  return {
    include: "yes" as const,
    quantity: 1, // We pass 1 so the API does base_cost * 1
    complexity: form.urgency,
    base_cost: finalCost,
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
    projectType: "",
    contentReady: "yes",
    urgency: "medium",
  });
  const [quickStatus, setQuickStatus] = useState<QuickStatus>("idle");
  const [quickMessage, setQuickMessage] = useState<UiMessage>({
    tone: "info",
    text: "Esta simulación es referencial y puede cambiar al validar alcance final.",
  });
  const [quoteResult, setQuoteResult] = useState<QuoteSimulateResponse | null>(null);
  const [isQuickResultStale, setIsQuickResultStale] = useState(false);
  const [modoCotizador, setModoCotizador] = useState<"rapido" | "avanzado">("rapido");

  // Gestión de captura de cliente (Opción 3: Post-Simulación)
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    redSocial: "WhatsApp",
  });
  const [isSaving, setIsSaving] = useState(false);

  function onContactFieldChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  }
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
    
    if (!quickForm.projectType) {
      return {
        ok: false,
        message: {
          tone: "error",
          text: "Para continuar, seleccioná qué tipo de web necesitas.",
        },
      };
    }

    let pages = 1;
    let urgencyFactor = 1.0;
    switch (quickForm.urgency) {
      case "low": urgencyFactor = 0.9; break;
      case "medium": urgencyFactor = 1.0; break;
      case "high": urgencyFactor = 1.25; break;
    }
    switch (quickForm.projectType) {
      case "landing": pages = 1; break;
      case "corporate": pages = 5; break;
      case "catalog": pages = 10; break;
      case "ecommerce": pages = 15; break;
      case "custom": pages = 20; break;
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
      const response = await simulateQuickQuote({
        persist: false, // Simulación pura, no guarda en DB/Notion aún
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
            needs_ecommerce: quickForm.projectType === "ecommerce" ? "yes" : "no",
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
      pages_estimate: quoteResult.input?.quick_answers?.pages_estimate || 0,
      needs_ecommerce: quickForm.projectType === "ecommerce" ? "yes" : "no",
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

  async function handleFinalSave(e: FormEvent) {
    e.preventDefault();
    if (!quoteResult || isSaving) return;

    if (!contactForm.nombre || !contactForm.email) {
      setQuickMessage({ tone: "error", text: "Por favor, completa nombre y email para recibir tu presupuesto." });
      return;
    }

    setIsSaving(true);
    setQuickMessage({ tone: "info", text: "Guardando tu presupuesto y enviando contacto..." });

    try {
      const validation = validateQuickForm();
      const pages = validation.ok ? validation.pages : 1;

      await simulateQuickQuote({
        persist: true, // Ahora sí guardamos en DB y Notion
        contact: {
          nombre: contactForm.nombre,
          email: contactForm.email,
          telefono: contactForm.telefono,
          red_social: contactForm.redSocial,
          mensaje: "Cliente interesado en presupuesto rápido simulado.",
          servicio: `Web — ${quickForm.projectType}`
        },
        context: {
          schema_version: QUICK_SCHEMA_VERSION,
          origin: "quick",
          project_type: QUICK_PROJECT_TYPE,
          project_state: QUICK_PROJECT_STATE,
          currency: QUICK_CURRENCY,
        },
        input: {
          quick_answers: {
            pages_estimate: pages,
            needs_ecommerce: quickForm.projectType === "ecommerce" ? "yes" : "no",
            urgency: quickForm.urgency,
          },
          line_items: [buildLineItemFromQuickAnswers(quickForm)],
        },
      });

      trackContactSubmitted("quick", quoteResult.totals.total_project);
      
      setQuickStatus("idle"); // Reset status para mostrar éxito limpio
      setQuickMessage({ 
        tone: "info", 
        text: `¡Listo ${contactForm.nombre}! Tu presupuesto ha sido registrado. Te contactaremos a ${contactForm.email} a la brevedad.` 
      });
      setShowContactForm(false);
      setQuoteResult(null); // Limpiamos para evitar duplicados
    } catch (error) {
      console.error("Error en guardado final:", error);
      setQuickMessage({ tone: "error", text: "Hubo un error al guardar. Por favor reintenta." });
    } finally {
      setIsSaving(false);
    }
  }

  function handleContactarAhora() {
    setShowContactForm(true);
    setQuickMessage({
      tone: "info",
      text: "Completá tus datos para recibir este presupuesto formalmente.",
    });
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
                  {/* Tipo de Proyecto */}
                  <div className="quick-quote__group">
                    <label className="quick-quote__label">¿Qué tipo de proyecto tienes en mente? *</label>
                    <div className="feature-cards-grid">
                      {[
                        { id: 'landing', title: 'Landing Page', icon: '🚀', desc: '1 página ideal para campañas o un solo producto.' },
                        { id: 'corporate', title: 'Corporativa', icon: '🏢', desc: 'Sitio profesional con múltiples secciones informativas.' },
                        { id: 'catalog', title: 'Catálogo', icon: '📖', desc: 'Muestra tus productos sin venta online directa.' },
                        { id: 'ecommerce', title: 'E-Commerce', icon: '🛒', desc: 'Tienda online completa con carrito y pagos.' },
                        { id: 'custom', title: 'A Medida', icon: '🛠️', desc: 'Sistemas avanzados y plataformas personalizadas.' }
                      ].map(type => (
                        <div 
                          key={type.id}
                          className={`feature-card ${quickForm.projectType === type.id ? 'active' : ''}`}
                          onClick={() => onQuickFieldChange("projectType", type.id as QuickForm["projectType"])}
                        >
                          <div className="feature-card__icon">{type.icon}</div>
                          <h4>{type.title}</h4>
                          <p>{type.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="quick-quote__row">
                    {/* Contenido */}
                    <div className="quick-quote__group">
                      <label className="quick-quote__label">¿Tienes el contenido listo? *</label>
                      <div className="radio-option-group">
                        {[
                          { id: 'yes', label: 'Sí, listo', icon: '✅' },
                          { id: 'partial', label: 'A medias', icon: '📝' },
                          { id: 'no', label: 'No, necesito ayuda', icon: '❌' }
                        ].map(opt => (
                          <div 
                            key={opt.id}
                            className={`form-option ${quickForm.contentReady === opt.id ? 'active' : ''}`}
                            onClick={() => onQuickFieldChange("contentReady", opt.id as QuickForm["contentReady"])}
                          >
                            <span>{opt.icon} {opt.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Urgencia */}
                    <div className="quick-quote__group">
                      <label className="quick-quote__label">¿Para cuándo lo necesitas? *</label>
                      <div className="radio-option-group">
                        {[
                          { id: 'low', label: 'Sin prisa', icon: '⏳' },
                          { id: 'medium', label: 'Normal', icon: '📅' },
                          { id: 'high', label: 'Urgente', icon: '🔥' }
                        ].map(opt => (
                          <div 
                            key={opt.id}
                            className={`form-option ${quickForm.urgency === opt.id ? 'active' : ''}`}
                            onClick={() => onQuickFieldChange("urgency", opt.id as "low" | "medium" | "high")}
                          >
                            <span>{opt.icon} {opt.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="quick-quote__submit"
                    disabled={quickStatus === "loading" || quickStatus === "validating"}
                  >
                    {quickStatus === "loading" ? "Calculando..." : "Calcular Cotización Referencial"}
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
                      {!showContactForm ? (
                        <>
                          <button type="button" onClick={handleRefinarAvanzada}>
                            Refinar en cotización avanzada
                          </button>
                          <button type="button" onClick={handleContactarAhora}>
                            Contactar ahora
                          </button>
                        </>
                      ) : (
                        <form className="quick-contact-integrated" onSubmit={handleFinalSave}>
                          <div className="quick-contact-integrated__fields">
                            <input 
                              type="text" 
                              name="nombre" 
                              placeholder="Nombre completo" 
                              required 
                              value={contactForm.nombre}
                              onChange={onContactFieldChange}
                            />
                            <input 
                              type="email" 
                              name="email" 
                              placeholder="Tu mejor Email" 
                              required 
                              value={contactForm.email}
                              onChange={onContactFieldChange}
                            />
                            <input 
                              type="tel" 
                              name="telefono" 
                              placeholder="WhatsApp (opcional)" 
                              value={contactForm.telefono}
                              onChange={onContactFieldChange}
                            />
                          </div>
                          <div className="quick-contact-integrated__actions">
                            <button type="submit" disabled={isSaving}>
                              {isSaving ? "Guardando..." : "Confirmar y Enviar Presupuesto"}
                            </button>
                            <button type="button" className="btn-cancel" onClick={() => setShowContactForm(false)}>
                              Cancelar
                            </button>
                          </div>
                        </form>
                      )}
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
