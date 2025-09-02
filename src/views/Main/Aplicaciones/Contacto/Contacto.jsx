import Encabezado from "@utilities/Elementos/Encabezado/Encabezado.jsx";
import Configuracion from "./Configuracion";
import "./Estilo.css";
import FormularioContacto from "@utilities/Elementos/Formularios/FormularioContacto";
import TarjetasDestacadas from "@utilities/Elementos/TarjetasDestacadas";

function Contacto() {
  return (
    <>
      <Encabezado encabezado={Configuracion.contenido.encabezado} />
      <div id="contenedor-principal-contacto">
        <div id="contenedor-formulario">
          <h1>Envíame un mensaje 🤖</h1>
          <FormularioContacto Conf={Configuracion.contenido.formulario} />
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
