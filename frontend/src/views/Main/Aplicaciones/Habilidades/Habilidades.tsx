import Encabezado from "@utilities/Elementos/Encabezado/Encabezado";
import Configuracion from "./Configuracion/Configuracion";
import CarruselDestacadas from "./Elementos/CarruselDestacadas";
import TarjetasIncrustadas from "@utilities/Elementos/TarjetasIncrustadas";
import HabilidadesBackendConf from "./Configuracion/HabilidadesBackend.conf";
import HabilidadesFrontendConf from "./Configuracion/HabilidadesFrontend.conf";
import HabilidadesDestacadasConf from "./Configuracion/HabilidadesDestacadas.conf";
import "./Estilos.css";

function Habilidades() {
  return (
    <>
      <Encabezado encabezado={Configuracion.contenido.encabezado} />
      <section id="Habilidades" className="section-fade-in">
        <article id="tarjetas-destacadas">
          <CarruselDestacadas tarjetas={HabilidadesDestacadasConf} />
        </article>
        <article id="backend" className="tarjetas-incrustadas mask-horizontal">
          <h3 className="titulo-seccion">Backend</h3>
          <TarjetasIncrustadas Conf={HabilidadesBackendConf} />
        </article>
        <article id="frontend" className="tarjetas-incrustadas mask-horizontal">
          <h3 className="titulo-seccion">Frontend</h3>
          <TarjetasIncrustadas Conf={HabilidadesFrontendConf} />
        </article>
      </section>
    </>
  );
}

export default Habilidades;
