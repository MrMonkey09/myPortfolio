import Resumen from "./Elementos/Resumen.jsx";
import Encabezado from "./Elementos/Encabezado.jsx";
import Intereses from "./Elementos/Intereses.jsx";
import Configuracion from "./Configuracion.js";

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
