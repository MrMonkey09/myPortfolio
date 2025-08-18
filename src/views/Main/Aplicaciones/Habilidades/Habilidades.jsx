import Encabezado from "@utilities/Elementos/Encabezado/Encabezado.jsx";
import Configuracion from "./Configuracion/Configuracion";
import TarjetasDestacadas from "@utilities/Elementos/TarjetasDestacadas";
import TarjetasIncrustadas from "@utilities/Elementos/TarjetasIncrustadas";
import HabilidadesBackendConf from "./Configuracion/HabilidadesBackend.conf";
import HabilidadesFrontendConf from "./Configuracion/HabilidadesFrontend.conf";
import HabilidadesDestacadasConf from "./Configuracion/HabilidadesDestacadas.conf";
import "./Estilos.css";

function Habilidades() {
  return (
    <>
      <Encabezado encabezado={Configuracion.contenido.encabezado} />
      <section id="Habilidades">
        <article id="tarjetas-destacadas">
          <TarjetasDestacadas Conf={HabilidadesDestacadasConf} />
        </article>
        <article id="backend" className="tarjetas-incrustadas">
          <h3 id="titulo">Backend</h3>
          <TarjetasIncrustadas Conf={HabilidadesBackendConf} />
        </article>
        <article id="frontend" className="tarjetas-incrustadas">
          <h3 id="titulo">Frontend</h3>
          <TarjetasIncrustadas Conf={HabilidadesFrontendConf} />
        </article>
      </section>
    </>
  );
}

export default Habilidades;
