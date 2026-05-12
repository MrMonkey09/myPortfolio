import { useState, useCallback, useEffect, useRef } from "react";
import { useContactoNavegacion } from "@views/Main/ContactoNavegacionContext";
import { simulateQuickQuote } from "@utilities/api";
import { MODULOS_PREDEFINIDOS, SERVICIOS_MENSUALES_PREDEFINIDOS, CONFIGURACION_AVANZADA } from "./Configuracion";
import type {
  AdvancedFormState,
  StepId,
  StepStatus,
  ContextoData,
  RequerimientosData,
  ModuloLinea,
  AjustesComerciales,
  MonthlyService,
  QuoteSimulateResponse,
} from "@types";
import AvanzadaContexto from "./AvanzadaContexto";
import AvanzadaRequerimientos from "./AvanzadaRequerimientos";
import AvanzadaModulos from "./AvanzadaModulos";
import AvanzadaAjustes from "./AvanzadaAjustes";
import AvanzadaResumen from "./AvanzadaResumen";
import {
  trackAdvancedStepViewed,
  trackAdvancedStepCompleted,
  trackAdvancedAbandoned,
  getOrCreateTraceId,
} from "@/hooks/useAnalytics";
import "./Estilos.css";

const STEPS: StepId[] = ["contexto", "requerimientos", "modulos", "ajustes", "resumen"];

// Naming de pasos para tracker
const stepNames: Record<StepId, string> = {
  contexto: "contexto",
  requerimientos: "requerimientos",
  modulos: "modulos",
  ajustes: "ajustes",
  resumen: "resumen",
};

// Ref para rastrear tiempos de entrada/salida en cada paso (performance.now())
const stepTimersRef = useRef<Map<number, number>>(new Map());

const INITIAL_CONTEXT: ContextoData = {
  projectType: "website",
  projectState: "new",
  country: "CL",
  priority: "medium",
};

const INITIAL_REQUERIMIENTOS: RequerimientosData = {
  diseno: true,
  desarrollo: true,
  contenido: false,
  seo: false,
  analytics: false,
};

const INITIAL_AJUSTES: AjustesComerciales = {
  urgencyMultiplier: 1.0,
  contingency_pct: 0.12,
  margin_pct: 0.25,
  discount_pct: 0,
  apply_vat: true,
  vat_pct: 0.19,
};

function Avanzada() {
  const {
    irAContactoConContexto,
    avanzadaHandoffContext,
    limpiarHandoffAvanzada,
  } = useContactoNavegacion();

  const [formState, setFormState] = useState<AdvancedFormState>({
    currentStep: "contexto",
    stepStatuses: {
      contexto: "active",
      requerimientos: "locked",
      modulos: "locked",
      ajustes: "locked",
      resumen: "locked",
    },
    globalStatus: "idle",
    contexto: INITIAL_CONTEXT,
    requerimientos: INITIAL_REQUERIMIENTOS,
    modulos: MODULOS_PREDEFINIDOS,
    ajustes: INITIAL_AJUSTES,
    serviciosMensuales: SERVICIOS_MENSUALES_PREDEFINIDOS,
    resultado: null,
    isStale: false,
    errorMessage: null,
  });

  // Inicializar traceId para tracking
  useEffect(() => {
    getOrCreateTraceId();
  }, []);

  // Ref para almacenar duración del paso anterior antes de avanzar
  const stepDurationRef = useRef<number>(0);

  // Pre-cargar contexto si viene de handoff (rápida → avanzada)
  useEffect(() => {
    if (avanzadaHandoffContext && !formState.resultado) {
      // Pre-cargar datos del handoff
      setFormState(prev => ({
        ...prev,
        contexto: {
          projectType: "website",
          projectState: "new",
          country: avanzadaHandoffContext.context?.country || "CL",
          priority: "medium",
        },
      resultado: null, // Requiere recalcular con nuevos datos
      isStale: true,
    });
    }
    }, [avanza daHandoffContext]);

    // Inicializar timer para el paso actual cuando cambia (usando performance.now())
    useEffect(() => {
      const stepIndex = STEPS.indexOf(formState.currentStep);
      if (stepIndex >= 0) {
        stepTimersRef.current.set(stepIndex, performance.now());
      }

      // Calcular tiempo en paso anterior y tracke que se visualizó este paso
      const timeOnPrevStepMs = stepDurationRef.current;
      if (timeOnPrevStepMs > 0) {
        trackAdvancedStepViewed(
          stepIndex + 1, // Step number is 1-indexed for analytics
          stepNames[formState.currentStep],
          timeOnPrevStepMs
        );
      }
    }, [formState.currentStep]);

  function validateCurrentStep(step: StepId): boolean {
    switch (step) {
      case "contexto":
        return Boolean(formState.contexto.projectType && formState.contexto.projectState);
      case "requerimientos":
        return Object.values(formState.requerimientos).some(Boolean);
      case "modulos":
        return formState.modulos.some(m => m.include === "yes" && m.quantity > 0 && m.complexity);
      case "ajustes":
        return true;
      case "resumen":
        return Boolean(formState.resultado);
    }
    return false;
  }

  function advanceToStep(nextStep: StepId) {
    const currentIndex = STEPS.indexOf(formState.currentStep);
    const nextIndex = STEPS.indexOf(nextStep);

    if (nextIndex > currentIndex && !validateCurrentStep(formState.currentStep)) {
      setFormState(prev => ({
        ...prev,
        globalStatus: "error",
        errorMessage: "Para continuar, completá los campos obligatorios del paso y corregí los errores marcados.",
      }));
      return;
    }

    // Calcular duración del paso actual antes de avanzar
    const durationMs = stepTimersRef.current.get(currentIndex)
      ? performance.now() - stepTimersRef.current.get(currentIndex)!
      : 0;
    stepDurationRef.current = durationMs;

    // Trackear completación del paso actual (si no es el resumen, ya que se avanza desde ajustes)
    if (currentIndex >= 0 && nextStep !== "resumen" && currentIndex < STEPS.length - 1) {
      trackAdvancedStepCompleted(
        currentIndex + 1, // Step number is 1-indexed for analytics
        stepNames[formState.currentStep],
        durationMs
      );
    }

    setFormState(prev => {
      const newStatuses = { ...prev.stepStatuses };
      newStatuses[prev.currentStep] = "completed";
      if (nextStep !== "resumen") newStatuses[nextStep] = "active";

      return {
        ...prev,
        currentStep: nextStep,
        stepStatuses: newStatuses,
        globalStatus: "idle",
        errorMessage: null,
      };
    });
  }

  function updateContexto(data: ContextoData) {
    setFormState(prev => ({
      ...prev,
      contexto: data,
      isStale: true,
    }));
  }

  function updateRequerimientos(data: RequerimientosData) {
    setFormState(prev => ({
      ...prev,
      requerimientos: data,
      isStale: true,
    }));
  }

  function updateModulos(modulos: ModuloLinea[]) {
    setFormState(prev => ({
      ...prev,
      modulos,
      isStale: true,
    }));
  }

  function updateAjustes(ajustes: AjustesComerciales) {
    setFormState(prev => ({
      ...prev,
      ajustes,
      isStale: true,
    }));
  }

  function updateServiciosMensuales(servicios: MonthlyService[]) {
    setFormState(prev => ({
      ...prev,
      serviciosMensuales: servicios,
      isStale: true,
    }));
  }

  async function handleCalcular() {
    setFormState(prev => ({ ...prev, globalStatus: "validating", errorMessage: null }));

    const lineItems = formState.modulos
      .filter(m => m.include === "yes" && m.quantity > 0)
      .map(m => ({
        module_id: m.module_id,
        module_name: m.module_name,
        category: m.category,
        include: m.include,
        quantity: m.quantity,
        complexity: m.complexity,
        base_cost: m.base_cost,
      }));

    try {
      const payload = {
        context: {
          schema_version: CONFIGURACION_AVANZADA.schema_version,
          origin: "advanced",
          project_type: formState.contexto.projectType || "website",
          project_state: formState.contexto.projectState,
          country: formState.contexto.country,
          currency: CONFIGURACION_AVANZADA.currency,
        },
        input: {
          requirements_checklist: formState.requerimientos,
          line_items: lineItems,
          pricing: {
            contingency_pct: formState.ajustes.contingency_pct,
            margin_pct: formState.ajustes.margin_pct,
            discount_pct: formState.ajustes.discount_pct,
            vat_pct: formState.ajustes.vat_pct,
            apply_vat: formState.ajustes.apply_vat,
          },
        },
      };

      const resultado = await simulateQuickQuote(payload);

      // Calcular total_monthly si hay servicios seleccionados
      const totalMensual = formState.serviciosMensuales
        .filter(s => s.include === "yes")
        .reduce((sum, s) => sum + s.monthly_value, 0);

      setFormState(prev => ({
        ...prev,
        globalStatus: "calculated",
        resultado: resultado,
        isStale: false,
        stepStatuses: {
          ...prev.stepStatuses,
          resumen: "completed",
        },
      }));
    } catch (error) {
      setFormState(prev => ({
        ...prev,
        globalStatus: "error",
        errorMessage: error instanceof Error ? error.message : "No pudimos calcular la cotización ahora. Intentá nuevamente.",
      }));
    }
  }

  function handleRecalculate() {
    // Reset resumen status y recalcular
    setFormState(prev => ({
      ...prev,
      globalStatus: "idle",
      stepStatuses: {
        ...prev.stepStatuses,
        resumen: "active",
      },
      currentStep: "ajustes",
    }));
  }

  function handleContactarAhora() {
    if (!formState.resultado) return;

    const quoteHandoffContext = {
      source: "advanced" as const,
      quote_ref: {
        quote_id: formState.resultado.quote.quote_id,
        origin: "advanced",
        total_project: formState.resultado.totals.total_project,
        total_monthly: formState.serviciosMensuales
          .filter(s => s.include === "yes")
          .reduce((sum, s) => sum + s.monthly_value, 0),
      },
      context: {
        project_type: formState.contexto.projectType || "website",
        project_state: formState.contexto.projectState || "new",
        currency: CONFIGURACION_AVANZADA.currency,
        schema_version: formState.resultado.meta.schema_version,
        pricing_config_version: formState.resultado.meta.pricing_config_version,
        trace_id: formState.resultado.meta.trace_id,
        confidence_level: formState.resultado.totals.confidence_level,
        is_stale: formState.isStale,
      },
      servicios_mensuales: formState.serviciosMensuales.filter(s => s.include === "yes"),
    };

    irAContactoConContexto("Cotización avanzada — seguimiento comercial", quoteHandoffContext);
    limpiarHandoffAvanzada();
  }

  // Renderizar paso activo
  function renderStep() {
    const { currentStep, stepStatuses } = formState;
    switch (currentStep) {
      case "contexto":
        return (
          <AvanzadaContexto
            value={formState.contexto}
            onChange={updateContexto}
            onNext={() => advanceToStep("requerimientos")}
            status={stepStatuses.contexto}
          />
        );
      case "requerimientos":
        return (
          <AvanzadaRequerimientos
            value={formState.requerimientos}
            onChange={updateRequerimientos}
            onNext={() => advanceToStep("modulos")}
            onBack={() => advanceToStep("contexto")}
            status={stepStatuses.requerimientos}
          />
        );
      case "modulos":
        return (
          <AvanzadaModulos
            value={formState.modulos}
            onChange={updateModulos}
            onNext={() => advanceToStep("ajustes")}
            onBack={() => advanceToStep("requerimientos")}
            status={stepStatuses.modulos}
          />
        );
      case "ajustes":
        return (
          <AvanzadaAjustes
            value={formState.ajustes}
            serviciosMensuales={formState.serviciosMensuales}
            onChange={updateAjustes}
            onChangeServicios={updateServiciosMensuales}
            onNext={handleCalcular}
            onBack={() => advanceToStep("modulos")}
            status={stepStatuses.ajustes}
          />
        );
      case "resumen":
        return (
          <AvanzadaResumen
            resultado={formState.resultado!}
            serviciosMensuales={formState.serviciosMensuales.filter(s => s.include === "yes")}
            onRecalculate={handleRecalculate}
            onContact={handleContactarAhora}
            isStale={formState.isStale}
          />
        );
    }
  }

  return (
    <section className="avanzada-container">
      {/* Stepper de navegación */}
      <nav className="avanzada-stepper">
        {STEPS.map((step, idx) => (
          <div
            key={step}
            className={`avanzada-stepper__item avanzada-stepper__item--${formState.stepStatuses[step]}`}
          >
            <span className="avanzada-stepper__number">{idx + 1}</span>
            <span className="avanzada-stepper__label">{step}</span>
          </div>
        ))}
      </nav>

      {/* Mensaje de error global */}
      {formState.errorMessage && (
        <div className="avanzada-error" role="alert">
          {formState.errorMessage}
        </div>
      )}

      {/* Contenido del paso activo */}
      <div className="avanzada-content">
        {renderStep()}
      </div>
    </section>
  );
}

export default Avanzada;
