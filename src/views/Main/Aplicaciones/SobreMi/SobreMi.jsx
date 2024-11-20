/* eslint-disable react/prop-types */
import EstiloPrincipal from "../../EstiloPrincipal";
import Resumen from "./Elementos/Resumen.jsx";
import Encabezado from "./Elementos/Encabezado.jsx";
import Intereses from "./Elementos/Intereses.jsx";

function SobreMi({ encabezado, resumen, intereses }) {
  return (
    <section style={EstiloPrincipal.enLinea.subContenedor}>
      <Encabezado encabezado={encabezado} />
      <Resumen resumen={resumen} />
      <Intereses intereses={intereses} />
    </section>
  );
}

export default SobreMi;
