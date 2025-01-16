import Encabezado from "@utilities/Elementos/Encabezado";
import Configuracion from "./Configuracion";
import "./Estilo.css";
import LineaTiempo from "@utilities/Elementos/LineaTiempo";
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
