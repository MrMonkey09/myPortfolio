import Resumen from "./Elementos/Resumen.jsx";
import Encabezado from "@utilities/Elementos/Encabezado/Encabezado.jsx";
import Intereses from "./Elementos/Intereses.jsx";
import Configuracion from "./Configuracion.js";
import "./SobreMi.css";

const contenido = Configuracion.contenido;

function SobreMi() {
  return (
    <>
      <Encabezado encabezado={contenido.encabezado} />
      <Resumen resumen={contenido.resumen} />
      <Intereses intereses={contenido.intereses} />
    </>
  );
}

export default SobreMi;
