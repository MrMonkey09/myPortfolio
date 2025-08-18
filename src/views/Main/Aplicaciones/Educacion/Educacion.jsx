import Encabezado from "@utilities/Elementos/Encabezado/Encabezado.jsx";
import Configuracion from "./Configuracion.js";
import "./Estilo.css";
import LineaTiempo from "@utilities/Elementos/LineaTiempo.jsx";
import Estilo from "./Estilo";

function Educacion() {
  
  return (
    <>
      <Encabezado encabezado={Configuracion.contenido.encabezado} />
      <section id="educacion">
        <LineaTiempo
          Conf={Configuracion.contenido.Puntos}
          CustomStyle={Estilo.enLinea.timeLine}
        />
      </section>
    </>
  );
}

export default Educacion;
