import Encabezado from "@utilities/Elementos/Encabezado/Encabezado";
import Configuracion from "./Configuracion";
import "./Estilo.css";
import LineaTiempo from "@utilities/Elementos/LineaTiempo";

function Educacion() {
  
  return (
    <>
      <Encabezado encabezado={Configuracion.contenido.encabezado} />
      <section id="educacion">
        <LineaTiempo
          Conf={Configuracion.contenido.Puntos}
        />
      </section>
    </>
  );
}

export default Educacion;
