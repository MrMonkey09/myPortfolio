import { useState } from "react";
import Encabezado from "@utilities/Elementos/Encabezado/Encabezado";
import Configuracion from "./Configuracion";
import "./Estilo.css";
import FormularioContacto from "@utilities/Elementos/Formularios/FormularioContacto";
import TarjetasDestacadas from "@utilities/Elementos/TarjetasDestacadas";
import { ApiRequestError, notionCommit, submitQuoteLead } from "@utilities/api";
import { useContactoNavegacion } from "../../ContactoNavegacionContext";
import type { FormData } from "../../../../types";

const CAMPO_NOMBRE = "Nombre";
const CAMPO_CORREO = "Correo";
const CAMPO_TELEFONO = "N° de Contacto";
const CAMPO_CANAL = "Red Social Preferente";
const CAMPO_MENSAJE = "Mensaje";

type EstadoEnvio = {
  tipo: "loading" | "success" | "error" | null;
  mensaje: string;
  traceId?: string;
};

function Contacto() {
  const { servicioInteresPreset, quoteHandoffContext } = useContactoNavegacion();

  const [estadoEnvio, setEstadoEnvio] = useState<EstadoEnvio>({ tipo: null, mensaje: "" });

  async function recepcionFormulario(formData: FormData) {
    const mensaje = (formData[CAMPO_MENSAJE] ?? "").replace(/\n/g, " ~ ");
    const formulario = { ...formData };
    formulario[CAMPO_MENSAJE] = mensaje;

    setEstadoEnvio({ tipo: "loading", mensaje: "Enviando tu mensaje..." });

    try {
      if (quoteHandoffContext) {
        await submitQuoteLead(
          {
            contact: {
              nombre: formData[CAMPO_NOMBRE] ?? "",
              email: formData[CAMPO_CORREO] ?? "",
              telefono: formData[CAMPO_TELEFONO] ?? "",
              red_social: formData[CAMPO_CANAL] ?? "",
            },
            quote_ref: {
              quote_id: quoteHandoffContext.quote_ref.quote_id,
              origin: quoteHandoffContext.quote_ref.origin,
              total_project: quoteHandoffContext.quote_ref.total_project,
              total_monthly: quoteHandoffContext.quote_ref.total_monthly,
            },
            message: mensaje,
          },
          quoteHandoffContext.context.trace_id,
        );

        setEstadoEnvio({
          tipo: "success",
          mensaje: "¡Lead enviado con éxito! Ya quedó asociado a tu cotización para seguimiento comercial. 🚀",
        });
        return;
      }

      await notionCommit(JSON.stringify(formulario));
      setEstadoEnvio({
        tipo: "success",
        mensaje: "¡Mensaje enviado con éxito! Me pondré en contacto pronto. 🚀",
      });
    } catch (error) {
      if (error instanceof ApiRequestError) {
        setEstadoEnvio({
          tipo: "error",
          mensaje: error.message,
          traceId: error.traceId,
        });
        return;
      }

      setEstadoEnvio({
        tipo: "error",
        mensaje:
          "Error al enviar el formulario. Por favor, escribime por Whatsapp +56 9 64373971.",
      });
    }
  }

  const mensajePresetCotizacion = quoteHandoffContext
    ? [
        `Hola, quiero avanzar con la cotización ${quoteHandoffContext.quote_ref.quote_id}.`,
        `Origen: ${quoteHandoffContext.quote_ref.origin}.`,
        `Total proyecto referencial: ${quoteHandoffContext.quote_ref.total_project}.`,
        `Total mensual referencial: ${quoteHandoffContext.quote_ref.total_monthly}.`,
        `Confianza: ${quoteHandoffContext.context.confidence_level}.`,
        `Moneda: ${quoteHandoffContext.context.currency}.`,
        `Trace: ${quoteHandoffContext.context.trace_id}.`,
        quoteHandoffContext.context.is_stale
          ? "Nota: el resumen llegó marcado como desactualizado y puede requerir recálculo."
          : "",
      ]
        .filter(Boolean)
        .join("\n")
    : "";

  return (
    <>
      <Encabezado encabezado={Configuracion.contenido.encabezado} />
      <div id="contenedor-principal-contacto" className="section-fade-in">
        <div id="contenedor-formulario">
          <h1>Envíame un mensaje 🤖</h1>
          {quoteHandoffContext && (
            <div className="mensaje-contexto-cotizacion" role="status">
              Contexto de cotización pre-cargado ({quoteHandoffContext.quote_ref.quote_id}).
              {quoteHandoffContext.context.is_stale
                ? " Está desactualizado: te recomiendo recalcular antes de cerrar alcance."
                : " Listo para seguimiento comercial."}
            </div>
          )}
          {estadoEnvio.tipo && (
            <div className={`mensaje-estado mensaje-estado--${estadoEnvio.tipo}`}>
              {estadoEnvio.mensaje}
              {estadoEnvio.traceId && (
                <div className="mensaje-estado-trace">Trace ID: {estadoEnvio.traceId}</div>
              )}
            </div>
          )}
          <FormularioContacto
            Conf={Configuracion.contenido.formulario}
            enviarFormulario={recepcionFormulario}
            presetServicioDesdeCatalogo={servicioInteresPreset}
            presetMensaje={mensajePresetCotizacion}
            isSubmitting={estadoEnvio.tipo === "loading"}
          />
        </div>
        <div id="contenedor-contacto">
          <h1>Mis datos de contacto</h1>
          <TarjetasDestacadas Conf={Configuracion.contenido.contactos} />
        </div>
      </div>
    </>
  );
}

export default Contacto;
