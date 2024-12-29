import Encabezado from "@utilities/Elementos/Encabezado";
import Configuracion from "./Configuracion";
import Estilo from "./Estilo";

function Habilidades() {
  return (
    <>
      <Encabezado encabezado={Configuracion.contenido.encabezado} />
      <section style={Estilo.enLinea.seccion} className={Estilo.clases}>
        <article style={Estilo.enLinea.seccion.tarjetasDestacadas} id="tarjetas-destacadas">
          <ul style={Estilo.enLinea.seccion.tarjetasDestacadas.listado} >
            <li style={Estilo.enLinea.seccion.tarjetasDestacadas.listado.tarjetas} >
              <svg height="80px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 10V8C6 7.65929 6.0284 7.32521 6.08296 7M18 10V8C18 4.68629 15.3137 2 12 2C10.208 2 8.59942 2.78563 7.5 4.03126" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M11 22H8C5.17157 22 3.75736 22 2.87868 21.1213C2 20.2426 2 18.8284 2 16C2 13.1716 2 11.7574 2.87868 10.8787C3.75736 10 5.17157 10 8 10H16C18.8284 10 20.2426 10 21.1213 10.8787C22 11.7574 22 13.1716 22 16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H15" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <h2>ola</h2>
              <span>wena</span>
            </li>
            <li style={Estilo.enLinea.seccion.tarjetasDestacadas.listado.tarjetas} >
              <svg height="80px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 10V8C6 7.65929 6.0284 7.32521 6.08296 7M18 10V8C18 4.68629 15.3137 2 12 2C10.208 2 8.59942 2.78563 7.5 4.03126" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M11 22H8C5.17157 22 3.75736 22 2.87868 21.1213C2 20.2426 2 18.8284 2 16C2 13.1716 2 11.7574 2.87868 10.8787C3.75736 10 5.17157 10 8 10H16C18.8284 10 20.2426 10 21.1213 10.8787C22 11.7574 22 13.1716 22 16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H15" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <h2>ola</h2>
              <span>wena</span>
            </li>
            <li style={Estilo.enLinea.seccion.tarjetasDestacadas.listado.tarjetas} >
              <svg height="80px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 10V8C6 7.65929 6.0284 7.32521 6.08296 7M18 10V8C18 4.68629 15.3137 2 12 2C10.208 2 8.59942 2.78563 7.5 4.03126" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M11 22H8C5.17157 22 3.75736 22 2.87868 21.1213C2 20.2426 2 18.8284 2 16C2 13.1716 2 11.7574 2.87868 10.8787C3.75736 10 5.17157 10 8 10H16C18.8284 10 20.2426 10 21.1213 10.8787C22 11.7574 22 13.1716 22 16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H15" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <h2>ola</h2>
              <span>wena</span>
            </li>
            <li style={Estilo.enLinea.seccion.tarjetasDestacadas.listado.tarjetas} >
              <svg height="80px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 10V8C6 7.65929 6.0284 7.32521 6.08296 7M18 10V8C18 4.68629 15.3137 2 12 2C10.208 2 8.59942 2.78563 7.5 4.03126" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M11 22H8C5.17157 22 3.75736 22 2.87868 21.1213C2 20.2426 2 18.8284 2 16C2 13.1716 2 11.7574 2.87868 10.8787C3.75736 10 5.17157 10 8 10H16C18.8284 10 20.2426 10 21.1213 10.8787C22 11.7574 22 13.1716 22 16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 18.8284 22 16 22H15" stroke="black" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <h2>ola</h2>
              <span>wena</span>
            </li>
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
