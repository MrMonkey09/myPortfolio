/* eslint-disable react/prop-types */
function TarjetasDestacadas({ Conf }) {
  console.log({ Conf });
  let tarjetas = Conf;
  return (
    <ul className="tarjetas" >
      {tarjetas.map((tarjeta) => {
        return (
          <li
            className="tarjeta"
            key={tarjeta.id ?? 0}
          >
            <img
              src={tarjeta.imagen}
              alt="img-prueba"
            />
            <div className="contenido" >
              <h2
                className="titulo"
              >
                {tarjeta.titulo}
              </h2>
              <span
                className="descripcion"
              >
                {tarjeta.descripcion}
              </span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default TarjetasDestacadas;
