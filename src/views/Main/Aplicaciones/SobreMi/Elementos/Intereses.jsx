/* eslint-disable react/prop-types */
function Intereses({ intereses }) {
  return (
    <div id="intereses">
      <div id="tarjeta">
        <img
          src={intereses.listado[0].icono}
          alt="icono-interes"
          width="100px"
        />
        <div id="contenido-tarjeta">
          <h4>{intereses.listado[0].nombre}</h4>
          <span>{intereses.listado[0].descripcion}</span>
        </div>
      </div>
    </div>
  );
}

export default Intereses;
