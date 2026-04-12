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
          <li key={tarjeta.id ?? 0} className="tarjeta tarjeta-incrustada">
            <div className="tarjeta-incrustada__media">
              <img src={tarjeta.imagen} alt={tarjeta.titulo} />
            </div>
            <div className="tarjeta-incrustada__body">
              <h3 className="tarjeta-incrustada__titulo">{tarjeta.titulo}</h3>
              <span className="tarjeta-incrustada__desc">{tarjeta.descripcion}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default TarjetasIncrustadas;
