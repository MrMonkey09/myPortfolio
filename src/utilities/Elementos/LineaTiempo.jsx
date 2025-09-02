import { useEffect, useRef } from "react";

/* eslint-disable react/prop-types */
function PuntoTiempo({ Punto }) {
  const descripcionHtml = useRef(null);

  useEffect(() => {
    console.log("PuntoTiempo: ", Punto);
    console.log("PuntoTiempo descripcionHtml: ", descripcionHtml.current);
    const descripcionFormateada = Punto.descripcion.replace(/\n/g, "<br>");
    descripcionHtml.current.innerHTML = descripcionFormateada;
    console.log("PuntoTiempo descripcionFormateada: ", descripcionHtml.current);
    console.log("PuntoTiempo texto formateado: ", descripcionFormateada);
  }, [descripcionHtml]);

  return (
    <li className="timeLineItem" id={Punto.id}>
      <article id="timeLineItemContent">
        <header className="header">
          <div className="header-left">
            <h3 className="title">{Punto.titulo}</h3>
            <div className="info">
              <span className="ciudad">{Punto.ubicacion}</span>
            </div>
          </div>
          <div className="header-right">
            <img
              src="/assets/images/iconos/calendario.svg"
              alt="icono calendario"
            />
            <span>{Punto.fecha}</span>
          </div>
        </header>
        <main className="main">
          <div className="text">
            <p ref={descripcionHtml}>{Punto.descripcion}</p>
          </div>
          <div className="tags">
            {Punto.etiquetas && Punto.etiquetas.map((etiqueta, idx) => (
              <span key={idx} className="badge">
              <div className="fa-icon-wrapper d-inline me-2 opacity-25">
                <i className="fa-icon fa-solid fa-bullseye"></i>
              </div>
                {etiqueta}
            </span>
            ))}
          </div>
        </main>
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

