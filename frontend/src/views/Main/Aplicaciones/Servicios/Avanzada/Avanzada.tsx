import { useState, useEffect, type FormEvent } from "react";
import { MODULOS_PREDEFINIDOS, SERVICIOS_MENSUALES_PREDEFINIDOS, CONFIGURACION_AVANZADA } from "./Configuracion";
import { simulateQuickQuote } from "@utilities/api";
import type {
  AdvancedFormState,
  StepId,
  ContextoData,
  RequerimientosData,
  ModuloLinea,
  AjustesComerciales,
  MonthlyService,
  QuoteSimulateResponse,
  QuoteSimulateRequest,
  StepStatus,
} from "@/types/index.js";
import AvanzadaContexto from "./AvanzadaContexto";
import AvanzadaRequerimientos from "./AvanzadaRequerimientos";
import AvanzadaModulos from "./AvanzadaModulos";
import AvanzadaAjustes from "./AvanzadaAjustes";
import AvanzadaResumen from "./AvanzadaResumen";
import {
  trackAdvancedStepViewed,
  trackAdvancedStepCompleted,
  trackContactSubmitted,
} from "@/hooks/useAnalytics";
import useAnalytics from "@/hooks/useAnalytics";
import "./Estilos.css";

const STEPS: StepId[] = ["contexto", "requerimientos", "modulos", "ajustes", "resumen"];

const stepUINames: Record<StepId, string> = {
  contexto: "Tu Proyecto",
  requerimientos: "Servicios Clave",
  modulos: "Funcionalidades",
  ajustes: "Soporte Mensual",
  resumen: "Presupuesto Final",
};

const INITIAL_CONTEXT: ContextoData = {
  projectType: "website",
  projectState: "new",
  priority: "medium",
  country: "CL",
};

const INITIAL_REQUERIMIENTOS: RequerimientosData = {
  diseno: "no",
  redaccion: "no",
};

const INITIAL_AJUSTES: AjustesComerciales = {
  contingency_pct: 0.1,
  margin_pct: 0.25,
  discount_pct: 0,
  urgency: "medium",
};

const INITIAL_STATUSES: Record<StepId, StepStatus> = {
  contexto: "active",
  requerimientos: "locked",
  modulos: "locked",
  ajustes: "locked",
  resumen: "locked",
};

function Avanzada() {
  const { getOrCreateTraceId } = useAnalytics();
  const [activeStep, setActiveStep] = useState<StepId>("contexto");
  const [formState, setFormState] = useState<AdvancedFormState>({
    currentStep: "contexto",
    stepStatuses: INITIAL_STATUSES,
    contexto: INITIAL_CONTEXT,
    requerimientos: INITIAL_REQUERIMIENTOS,
    modulos: [...MODULOS_PREDEFINIDOS],
    ajustes: INITIAL_AJUSTES,
    serviciosMensuales: [...SERVICIOS_MENSUALES_PREDEFINIDOS],
    globalStatus: "active",
    errorMessage: null,
    resultado: null,
    isStale: true,
  });

  // Gestión de captura de cliente (Opción 3: Post-Simulación)
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactForm, setContactForm] = useState({
    nombre: "",
    email: "",
    telefono: "",
    redSocial: "WhatsApp",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  function onContactFieldChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  }

  async function handleFinalSave(e: FormEvent) {
    e.preventDefault(); // Evitamos el refresh de la página
    if (!formState.resultado || isSaving) return;
    
    if (!contactForm.nombre || !contactForm.email) {
      setFormState(prev => ({ ...prev, errorMessage: "Por favor, completa nombre y email para recibir tu presupuesto." }));
      return;
    }

    setIsSaving(true);
    setFormState(prev => ({ ...prev, errorMessage: null }));

    try {
      const traceId = getOrCreateTraceId();
      
      // Re-construimos el payload pero con persist: true y contact info
      const syncModulos = formState.modulos.map((m: ModuloLinea) => {
        let include = m.include;
        let quantity = m.quantity;
        // ... (lógica de sync simplificada para el guardado final)
        if (m.module_id === "diseno-ui-ux" && formState.requerimientos.diseno === "yes") include = "yes";
        if (m.module_id === "contenido" && formState.requerimientos.redaccion === "yes") include = "yes";
        return { ...m, include, quantity: quantity || (include === "yes" ? 1 : 0) };
      });

      const lineItems = syncModulos
        .filter((m: ModuloLinea) => m.include === "yes" && m.quantity > 0)
        .map((m: ModuloLinea) => ({
          module_id: m.module_id,
          module_name: m.module_name,
          category: m.category,
          include: m.include,
          quantity: m.quantity,
          complexity: m.complexity,
          base_cost: m.base_cost,
          unit_hours: m.unit_hours,
        }));

      const payload: QuoteSimulateRequest = {
        persist: true, // AHORA SÍ
        contact: {
          nombre: contactForm.nombre,
          email: contactForm.email,
          telefono: contactForm.telefono,
          red_social: contactForm.redSocial,
          mensaje: "Interesado en presupuesto avanzado detallado.",
          servicio: `Proyecto Avanzado — ${formState.contexto.projectType}`
        },
        context: {
          schema_version: CONFIGURACION_AVANZADA.schema_version,
          origin: "advanced",
          project_type: formState.contexto.projectType,
          project_state: formState.contexto.projectState,
          country: formState.contexto.country,
          currency: CONFIGURACION_AVANZADA.currency,
          trace_id: traceId,
        },
        input: {
          requirements_checklist: formState.requerimientos,
          line_items: lineItems,
          monthly_services: formState.serviciosMensuales,
          pricing: {
            contingency_pct: formState.ajustes.contingency_pct,
            margin_pct: formState.ajustes.margin_pct,
            discount_pct: formState.ajustes.discount_pct,
            vat_pct: 0.19,
          },
        },
      };

      await simulateQuickQuote(payload);
      
      trackContactSubmitted('advanced', formState.resultado.totals.total_project);
      setSaveSuccess(true);
      setShowContactForm(false);
    } catch (err: any) {
      setFormState(prev => ({ ...prev, errorMessage: "Error al enviar contacto. Por favor reintenta." }));
    } finally {
      setIsSaving(false);
    }
  }

  useEffect(() => {
    trackAdvancedStepViewed(1, 'contexto');
  }, []);

  // Sincronizar requerimientos → módulos al navegar al paso 3
  useEffect(() => {
    if (activeStep === "modulos") {
      if (formState.requerimientos.diseno === "yes") {
        const disenoModule = formState.modulos.find(m => m.module_id === "diseno-ui-ux");
        if (disenoModule && disenoModule.include === "no") {
          updateModulos(formState.modulos.map(m =>
            m.module_id === "diseno-ui-ux" ? { ...m, include: "yes" as const, quantity: 1 } : m
          ));
        }
      }
      if (formState.requerimientos.redaccion === "yes") {
        const contenidoModule = formState.modulos.find(m => m.module_id === "contenido");
        if (contenidoModule && contenidoModule.include === "no") {
          updateModulos(formState.modulos.map(m =>
            m.module_id === "contenido" ? { ...m, include: "yes" as const, quantity: 1 } : m
          ));
        }
      }
    }
  }, [activeStep]);

  function handleNext() {
    const currentIndex = STEPS.indexOf(activeStep);
    if (currentIndex < STEPS.length - 1) {
      const nextStep = STEPS[currentIndex + 1];
      trackAdvancedStepCompleted(currentIndex + 1, activeStep, 0);
      setActiveStep(nextStep);
      
      if (nextStep === "resumen") {
        handleCalcular();
      }
    }
  }

  function handleBack() {
    const currentIndex = STEPS.indexOf(activeStep);
    if (currentIndex > 0) {
      setActiveStep(STEPS[currentIndex - 1]);
    }
  }

  function updateContexto(contexto: ContextoData) {
    setFormState(prev => ({ ...prev, contexto, isStale: true }));
  }

  function updateRequerimientos(requerimientos: RequerimientosData) {
    setFormState(prev => ({ ...prev, requerimientos, isStale: true }));
  }

  function updateModulos(modulos: readonly ModuloLinea[]) {
    setFormState(prev => ({ ...prev, modulos: [...modulos], isStale: true }));
  }

  function updateAjustes(ajustes: AjustesComerciales) {
    setFormState(prev => ({ ...prev, ajustes, isStale: true }));
  }

  function updateServiciosMensuales(servicios: MonthlyService[]) {
    setFormState(prev => ({ ...prev, serviciosMensuales: [...servicios], isStale: true }));
  }

  async function handleCalcular() {
    setFormState(prev => ({ ...prev, globalStatus: "validating", errorMessage: null }));

    // Sincronización de respuestas conversacionales a módulos técnicos
    const syncModulos = formState.modulos.map((m: ModuloLinea) => {
      let include = m.include;
      let quantity = m.quantity;

      if (m.module_id === "diseno-ui-ux" && formState.requerimientos.diseno === "yes") {
        include = "yes";
        if (quantity === 0) quantity = 1;
      }
      if (m.module_id === "contenido" && formState.requerimientos.redaccion === "yes") {
        include = "yes";
        if (quantity === 0) quantity = 1;
      }
      
      // Auto-include frontend if pages > 0
      if (m.module_id === "desarrollo-frontend" && include === "no") {
         if (m.quantity > 0) include = "yes";
      }

      return { ...m, include, quantity };
    });

    const lineItems = syncModulos
      .filter((m: ModuloLinea) => m.include === "yes" && m.quantity > 0)
      .map((m: ModuloLinea) => ({
        module_id: m.module_id,
        module_name: m.module_name,
        category: m.category,
        include: m.include,
        quantity: m.quantity,
        complexity: m.complexity,
        base_cost: m.base_cost,
        unit_hours: m.unit_hours,
      }));

    const traceId = getOrCreateTraceId();
    try {
      const payload: QuoteSimulateRequest = {
        context: {
          schema_version: CONFIGURACION_AVANZADA.schema_version,
          origin: "advanced",
          project_type: formState.contexto.projectType,
          project_state: formState.contexto.projectState,
          country: formState.contexto.country,
          currency: CONFIGURACION_AVANZADA.currency,
          trace_id: traceId,
        },
        input: {
          requirements_checklist: formState.requerimientos,
          line_items: lineItems,
          monthly_services: formState.serviciosMensuales,
          pricing: {
            contingency_pct: formState.ajustes.contingency_pct,
            margin_pct: formState.ajustes.margin_pct,
            discount_pct: formState.ajustes.discount_pct,
            vat_pct: 0.19,
          },
        },
      };
      
      const data = await simulateQuickQuote({
        ...payload,
        persist: false
      });
      setFormState(prev => ({
        ...prev,
        resultado: data,
        globalStatus: "completed",
        isStale: false,
      }));
    } catch (err: any) {
      setFormState(prev => ({
        ...prev,
        globalStatus: "invalid",
        errorMessage: err.message || "No se pudo calcular el presupuesto",
      }));
    }
  }

  return (
    <div className="avanzada">
      <nav className="avanzada__steps">
        {STEPS.map((step, idx) => (
          <div
            key={step}
            className={`avanzada__step ${activeStep === step ? "avanzada__step--active" : ""} ${STEPS.indexOf(activeStep) > idx ? "avanzada__step--completed" : ""}`}
          >
            <span className="avanzada__step-number">{idx + 1}</span>
            <span className="avanzada__step-label">{stepUINames[step]}</span>
          </div>
        ))}
      </nav>

      <main className="avanzada__content">
        {activeStep === "contexto" && (
          <AvanzadaContexto
            value={formState.contexto}
            onChange={updateContexto}
            onNext={handleNext}
            status="active"
          />
        )}
        {activeStep === "requerimientos" && (
          <AvanzadaRequerimientos
            value={formState.requerimientos}
            onChange={updateRequerimientos}
            onNext={handleNext}
            onBack={handleBack}
            status="active"
          />
        )}
        {activeStep === "modulos" && (
          <AvanzadaModulos
            value={formState.modulos}
            onChange={updateModulos}
            onNext={handleNext}
            onBack={handleBack}
            status={activeStep === "modulos" ? "active" : "completed"}
            requerimientos={formState.requerimientos}
          />
        )}
        {activeStep === "ajustes" && (
          <AvanzadaAjustes
            value={formState.ajustes}
            onChange={updateAjustes}
            onNext={handleNext}
            onBack={handleBack}
            serviciosMensuales={formState.serviciosMensuales}
            onChangeServicios={updateServiciosMensuales}
            status="active"
          />
        )}
        {activeStep === "resumen" && formState.resultado && (
          <AvanzadaResumen
            resultado={formState.resultado}
            serviciosMensuales={formState.serviciosMensuales}
            ajustes={formState.ajustes}
            onRecalculate={handleCalcular}
            showContactForm={showContactForm}
            contactForm={contactForm}
            onContactFieldChange={onContactFieldChange}
            onContactClick={() => setShowContactForm(true)}
            onFinalSubmit={handleFinalSave}
            isSaving={isSaving}
            saveSuccess={saveSuccess}
            isStale={formState.isStale}
          />
        )}

        {formState.errorMessage && (
          <div className="avanzada__error-banner">
            {formState.errorMessage}
          </div>
        )}
      </main>
    </div>
  );
}

export default Avanzada;
