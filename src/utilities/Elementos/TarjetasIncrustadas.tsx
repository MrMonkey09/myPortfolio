import type { Tarjeta } from "../../types";

interface TarjetasIncrustadasProps {
  readonly Conf: readonly Tarjeta[];
}

function TarjetasIncrustadas({ Conf }: Readonly<TarjetasIncrustadasProps>) {
  const tarjetas = Conf;
  return (
    <ul className="tarjetas">
      {tarjetas.map((tarjeta) => {
        return (
          <li key={tarjeta.id ?? 0} className="tarjeta">
            <div id="contenedor-imagen">
              <img src={tarjeta.imagen} alt="habilidad-img" />
            </div>
            <div id="contenedor-texto">
              <h3 id="titulo">{tarjeta.titulo}</h3>
              <span id="descripcion">{tarjeta.descripcion}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default TarjetasIncrustadas;
