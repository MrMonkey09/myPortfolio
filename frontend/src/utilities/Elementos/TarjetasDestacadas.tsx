import type { Tarjeta } from "../../types";
import "./TarjetasDestacadas.css";

interface TarjetasDestacadasProps {
  readonly Conf: readonly Tarjeta[];
}

function TarjetaInterior({
  tarjeta,
  imagenDecorativa,
}: Readonly<{ tarjeta: Tarjeta; imagenDecorativa?: boolean }>) {
  return (
    <>
      <img
        src={tarjeta.imagen}
        alt={imagenDecorativa ? "" : tarjeta.titulo}
      />
      <div className="contenido">
        <h2 className="titulo">{tarjeta.titulo}</h2>
        <span className="descripcion">{tarjeta.descripcion}</span>
      </div>
    </>
  );
}

function TarjetasDestacadas({ Conf }: Readonly<TarjetasDestacadasProps>) {
  const tarjetas = Conf;
  return (
    <ul className="tarjetas">
      {tarjetas.map((tarjeta) => {
        const href = tarjeta.enlace?.trim();
        const conEnlace = Boolean(href);
        const etiquetaAccesible = `${tarjeta.titulo}: ${tarjeta.descripcion}`;

        return (
          <li
            className={`tarjeta${conEnlace ? " tarjeta--con-enlace" : ""}`}
            key={tarjeta.id ?? 0}
          >
            {conEnlace && href ? (
              <a
                className="tarjeta-enlace"
                href={href}
                aria-label={etiquetaAccesible}
                {...(href.startsWith("mailto:") || href.startsWith("tel:")
                  ? { target: undefined, rel: undefined }
                  : {
                      target: "_blank",
                      rel: "noopener noreferrer",
                    })}
              >
                <TarjetaInterior tarjeta={tarjeta} imagenDecorativa />
              </a>
            ) : (
              <TarjetaInterior tarjeta={tarjeta} />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default TarjetasDestacadas;
