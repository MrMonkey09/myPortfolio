import { useState } from "react";
import Encabezado from "@utilities/Elementos/Encabezado/Encabezado";
import Configuracion from "./Configuracion";
import "./Estilo.css";
import FormularioContacto from "@utilities/Elementos/Formularios/FormularioContacto";
import TarjetasDestacadas from "@utilities/Elementos/TarjetasDestacadas";
import { notionCommit } from "@utilities/api";
import { useContactoNavegacion } from "../../ContactoNavegacionContext";
import type { FormData } from "../../../../types";

function Contacto() {
  const { servicioInteresPreset } = useContactoNavegacion();

  const [estadoEnvio, setEstadoEnvio] = useState<{tipo: 'success' | 'error' | null, mensaje: string}>({tipo: null, mensaje: ''});

  async function recepcionFormulario(formData: FormData) {
    const formulario = { ...formData };
    formulario["Mensaje"] = formulario["Mensaje"].replace(/\n/g, " ~ ");
    setEstadoEnvio({tipo: null, mensaje: ''});
    
    try {
      await notionCommit(JSON.stringify(formulario));
      setEstadoEnvio({tipo: 'success', mensaje: '¡Mensaje enviado con éxito! Me pondré en contacto pronto. 🚀'});
    } catch {
      setEstadoEnvio({tipo: 'error', mensaje: 'Error al enviar el formulario. Por favor, escribime por Whatsapp +56 9 64373971.'});
    }
  }

  return (
    <>
      <Encabezado encabezado={Configuracion.contenido.encabezado} />
      <div id="contenedor-principal-contacto" className="section-fade-in">
        <div id="contenedor-formulario">
          <h1>Envíame un mensaje 🤖</h1>
          {estadoEnvio.tipo && (
            <div className={`mensaje-estado mensaje-estado--${estadoEnvio.tipo}`}>
              {estadoEnvio.mensaje}
            </div>
          )}
          <FormularioContacto
            Conf={Configuracion.contenido.formulario}
            enviarFormulario={recepcionFormulario}
            presetServicioDesdeCatalogo={servicioInteresPreset}
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
