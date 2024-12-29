import Encabezado from "@utilities/Elementos/Encabezado";
import Configuracion from "./Configuracion";
import Estilo from "./Estilo";
import Tarjetas from "./Tarjetas";

function Habilidades() {


  return (
    <>
      <Encabezado encabezado={Configuracion.contenido.encabezado} />
      <section style={Estilo.enLinea.seccion} className={Estilo.clases}>
        <article style={Estilo.enLinea.seccion.tarjetasDestacadas} id="tarjetas-destacadas">
          <ul style={Estilo.enLinea.seccion.tarjetasDestacadas.tarjetas} >
            <Tarjetas />
          </ul>
        </article>
        {/* <article id="backend">
          <h3>Backend</h3>
          <ul>
            <li></li>
          </ul>
        </article> */}
        {/* <article id="frontend">
          <h3>Frontend</h3>
          <ul>
            <li>

            </li>
          </ul>
        </article> */}
        {/* <article id="idiomas">
          <h3>Idiomas</h3>
          <ul>
            <li></li>
          </ul>
        </article> */}
      </section>
    </>
  );
}

export default Habilidades;
