import Encabezado from "@utilities/Elementos/Encabezado/Encabezado.jsx";
import Configuracion from "./Configuracion";
import "./Estilos.css";
import TarjetasIncrustadas2 from "@utilities/Elementos/TarjetasIncrustadas2";

function Proyectos() {
  return (
    <>
      <Encabezado encabezado={Configuracion.contenido.encabezado} />
      <section className="proyectos-container">
        {/* <TarjetasIncrustadas2 Configuracion={Configuracion} /> */}
        En construcción...
      </section>
    </>
  );
}

export default Proyectos;
