import Encabezado from "@utilities/Elementos/Encabezado/Encabezado.jsx";
import Configuracion from "./Configuracion";
import "./Estilo.css";
import FormularioContacto from "@utilities/Elementos/Formularios/FormularioContacto";
import TarjetasDestacadas from "@utilities/Elementos/TarjetasDestacadas";
import { notionCommit } from "@utilities/api";
import type { FormData } from "../../../../types";

function Contacto() {
  async function recepcionFormulario(formData: FormData) {
    const formulario = { ...formData };
    formulario["Mensaje"] = formulario["Mensaje"].replace(/\n/g, " ~ ");
    try {
      await notionCommit(JSON.stringify(formulario));
    } catch {
      window.alert("Error al enviar el formulario, por favor enviar mensaje via Whatsapp +56 9 64373971.");
    }
  }

  return (
    <>
      <Encabezado encabezado={Configuracion.contenido.encabezado} />
      <div id="contenedor-principal-contacto">
        <div id="contenedor-formulario">
          <h1>Envíame un mensaje 🤖</h1>
          <FormularioContacto
            Conf={Configuracion.contenido.formulario}
            enviarFormulario={recepcionFormulario}
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
