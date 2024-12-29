import Encabezado from "@utilities/Elementos/Encabezado";
import Configuracion from "./Configuracion";
import "./Estilo.css";

function Educacion() {
  return (
    <>
      <Encabezado encabezado={Configuracion.contenido.encabezado} />
      <section id="educacion">
        <ul id="timeLine">
          <li id="timeLineItem">
            <article id="timeLineItemContent">
              <div>
                <img src="" alt="" />
              </div>
              <div>
                <header>
                  <div className="header-left">
                    <h5 className="title">
                      <span className="text-highlight">Doctorado</span> en
                      Ciencias de la Computación
                    </h5>
                    <div className="info">
                      <div className="fa-icon-wrapper d-inline me-2">
                        <i className="fa-icon fa-solid fa-building"></i>
                      </div>
                      <span className="">Universidad de Harvard</span>
                    </div>
                  </div>
                  <div className="header-right">
                    <div className="info-badge text-1 undefined">
                      <div className="fa-icon-wrapper d-inline me-2 opacity-50">
                        <i className="fa-icon undefined"></i>
                      </div>
                      <span>Sept 2022 ➔ Jun 2024</span>
                    </div>
                  </div>
                </header>
                <main>
                  <div>
                    <div className="text">
                      <p>
                        Cursando un doctorado con enfoque en aprendizaje profundo
                        y sus aplicaciones en el mundo real, específicamente en:
                      </p>{" "}
                      <ul>
                        <li>Visión por Computadora</li>
                        <li>Investigación innovadora en IA</li>
                        <li>
                          Desarrollo de nuevos algoritmos para el reconocimiento
                          de imágenes
                        </li>
                      </ul>{" "}
                      <p className="mt-3">
                        Involucrado en investigaciones de vanguardia y
                        contribuyendo al avance de la IA a través de publicaciones
                        en conferencias de primer nivel.
                      </p>
                    </div>
                    <div className="tags">
                      <span className="badge badge-sm ">
                        <div className="fa-icon-wrapper d-inline me-2 opacity-25">
                          <i className="fa-icon fa-solid fa-bullseye"></i>
                        </div>
                        APRENDIZAJE PROFUNDO
                      </span>
                      <span className="badge badge-sm ">
                        <div className="fa-icon-wrapper d-inline me-2 opacity-25">
                          <i className="fa-icon fa-solid fa-bullseye"></i>
                        </div>
                        VISIÓN POR COMPUTADORA
                      </span>
                      <span className="badge badge-sm ">
                        <div className="fa-icon-wrapper d-inline me-2 opacity-25">
                          <i className="fa-icon fa-solid fa-bullseye"></i>
                        </div>
                        INVESTIGACIÓN IA
                      </span>
                      <span className="badge badge-sm ">
                        <div className="fa-icon-wrapper d-inline me-2 opacity-25">
                          <i className="fa-icon fa-solid fa-bullseye"></i>
                        </div>
                        ALGORITMOS
                      </span>
                    </div>
                  </div>
                </main>
              </div>
            </article>
          </li>
          <li id="timeLineItem">
            <article id="timeLineItemContent">
              <div>
                <img src="" alt="" />
              </div>
              <div>
                <header>
                  <div className="header-left">
                    <h5 className="title">
                      <span className="text-highlight">Doctorado</span> en
                      Ciencias de la Computación
                    </h5>
                    <div className="info">
                      <div className="fa-icon-wrapper d-inline me-2">
                        <i className="fa-icon fa-solid fa-building"></i>
                      </div>
                      <span className="">Universidad de Harvard</span>
                    </div>
                  </div>
                  <div className="header-right">
                    <div className="info-badge text-1 undefined">
                      <div className="fa-icon-wrapper d-inline me-2 opacity-50">
                        <i className="fa-icon undefined"></i>
                      </div>
                      <span>Sept 2022 ➔ Jun 2024</span>
                    </div>
                  </div>
                </header>
                <main>
                  <div>
                    <div className="text">
                      <p>
                        Cursando un doctorado con enfoque en aprendizaje profundo
                        y sus aplicaciones en el mundo real, específicamente en:
                      </p>{" "}
                      <ul>
                        <li>Visión por Computadora</li>
                        <li>Investigación innovadora en IA</li>
                        <li>
                          Desarrollo de nuevos algoritmos para el reconocimiento
                          de imágenes
                        </li>
                      </ul>{" "}
                      <p className="mt-3">
                        Involucrado en investigaciones de vanguardia y
                        contribuyendo al avance de la IA a través de publicaciones
                        en conferencias de primer nivel.
                      </p>
                    </div>
                    <div className="tags">
                      <span className="badge badge-sm ">
                        <div className="fa-icon-wrapper d-inline me-2 opacity-25">
                          <i className="fa-icon fa-solid fa-bullseye"></i>
                        </div>
                        APRENDIZAJE PROFUNDO
                      </span>
                      <span className="badge badge-sm ">
                        <div className="fa-icon-wrapper d-inline me-2 opacity-25">
                          <i className="fa-icon fa-solid fa-bullseye"></i>
                        </div>
                        VISIÓN POR COMPUTADORA
                      </span>
                      <span className="badge badge-sm ">
                        <div className="fa-icon-wrapper d-inline me-2 opacity-25">
                          <i className="fa-icon fa-solid fa-bullseye"></i>
                        </div>
                        INVESTIGACIÓN IA
                      </span>
                      <span className="badge badge-sm ">
                        <div className="fa-icon-wrapper d-inline me-2 opacity-25">
                          <i className="fa-icon fa-solid fa-bullseye"></i>
                        </div>
                        ALGORITMOS
                      </span>
                    </div>
                  </div>
                </main>
              </div>
            </article>
          </li>
        </ul>
      </section>
    </>
  );
}

export default Educacion;