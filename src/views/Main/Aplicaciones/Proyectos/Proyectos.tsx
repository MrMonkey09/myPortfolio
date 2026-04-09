import Encabezado from "@utilities/Elementos/Encabezado/Encabezado.jsx";
import Configuracion from "./Configuracion";
import "./Estilos.css";
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
