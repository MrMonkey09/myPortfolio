import Encabezado from "@utilities/Elementos/Encabezado";
import Configuracion from "./Configuracion/Configuracion";
import Estilo from "./Configuracion/Estilo";
import TarjetasDestacadas from "@utilities/Elementos/TarjetasDestacadas";
import TarjetasIncrustadas from "@utilities/Elementos/TarjetasIncrustadas";
import HabilidadesBackendConf from "./Configuracion/HabilidadesBackend.conf";
import HabilidadesFrontendConf from "./Configuracion/HabilidadesFrontend.conf";
import HabilidadesDestacadasConf from "./Configuracion/HabilidadesDestacadas.conf";

function Habilidades() {
  return (
    <>
      <Encabezado encabezado={Configuracion.contenido.encabezado} />
      <section style={Estilo.enLinea.seccion}>
        <article style={Estilo.enLinea.seccion.tarjetasDestacadas} id="tarjetas-destacadas">
          <TarjetasDestacadas Conf={HabilidadesDestacadasConf} CustomStyle={Estilo.enLinea.seccion.tarjetasDestacadas.tarjetas} />
        </article>
        <article id="backend" style={Estilo.enLinea.seccion.tecnologias}>
          <h3 style={Estilo.enLinea.seccion.tecnologias.titulo}>Backend</h3>
          <TarjetasIncrustadas Conf={HabilidadesBackendConf} CustomStyle={Estilo.enLinea.seccion.tecnologias.lista} />
        </article>
        <article id="frontend" style={Estilo.enLinea.seccion.tecnologias}>
          <h3 style={Estilo.enLinea.seccion.tecnologias.titulo}>Frontend</h3>
          <TarjetasIncrustadas Conf={HabilidadesFrontendConf} CustomStyle={Estilo.enLinea.seccion.tecnologias.lista} />
        </article>
      </section>
    </>
  );
}

export default Habilidades;
