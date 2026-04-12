import type { PuntoTiempoData } from "../../types";

interface PuntoTiempoProps {
  readonly Punto: PuntoTiempoData;
  readonly CustomStyle?: unknown;
}

function PuntoTiempo({ Punto }: Readonly<PuntoTiempoProps>) {
  return (
    <li className="timeLineItem" id={String(Punto.id)}>
      {Punto.logo && (
        <div className="timeLineItemLogo">
          <img src={Punto.logo} alt={`Logo ${Punto.universidad}`} />
        </div>
      )}
      <article className="timeLineItemContent">
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
            <p>{Punto.descripcion}</p>
          </div>
          <div className="tags">
            {Punto.etiquetas && Punto.etiquetas.map((etiqueta: string, idx: number) => (
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

interface LineaTiempoProps {
  readonly Conf: readonly PuntoTiempoData[];
  readonly CustomStyle?: Record<string, unknown>;
}

function LineaTiempo({ Conf, CustomStyle }: Readonly<LineaTiempoProps>) {
  const Puntos = Conf;
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

