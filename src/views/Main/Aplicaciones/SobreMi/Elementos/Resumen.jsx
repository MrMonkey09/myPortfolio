/* eslint-disable react/prop-types */
function Resumen({ resumen }) {
  console.log(resumen);
  return (
    <div id="resumen">
      <h3>
        Un poco <span>sobre mí...</span>
      </h3>
      <div>
        <img
          src={resumen.portada}
          alt="portada-resumen"
        />
        <span>{resumen.descripcion}</span>
      </div>
    </div>
  );
}

export default Resumen;
