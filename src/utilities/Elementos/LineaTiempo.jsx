/* eslint-disable react/prop-types */
function PuntoTiempo({ Punto }) {
  return (
    <li className="timeLineItem" id={Punto.id}>
      <article id="timeLineItemContent">
        <div>
          <img src={Punto.imagen} alt="" />
        </div>
        <div>
          <header>
            <div className="header-left">
              <h5 className="title">{Punto.titulo}</h5>
              <div className="info">
                <div className="fa-icon-wrapper d-inline me-2">
                  <i className="fa-icon fa-solid fa-building"></i>
                </div>
                <span className="">{Punto.ubicacion}</span>
              </div>
            </div>
            <div className="header-right">
              <div className="info-badge text-1 undefined">
                <div className="fa-icon-wrapper d-inline me-2 opacity-50">
                  <i className="fa-icon undefined"></i>
                </div>
                <span>{Punto.fecha}</span>
              </div>
            </div>
          </header>
          <main>
            <div>
              <div className="text">
                <p>{Punto.descripcion}</p>
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
  );
}

function LineaTiempo({ Conf, CustomStyle }) {
  let Puntos = Conf;
  return (
    <ul id="timeLine">
      {Puntos.map((Punto) => {
        return (
          <PuntoTiempo
            Punto={Punto}
            key={Punto.id}
            CustomStyle={CustomStyle?.timeLineItemContent}
          />
        );
      })}
    </ul>
  );
}

export default LineaTiempo;
