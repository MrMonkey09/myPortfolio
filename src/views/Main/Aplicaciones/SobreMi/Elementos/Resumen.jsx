import "./Resumen.css";
/* eslint-disable react/prop-types */
function Resumen({ resumen }) {
  return (
    <div id="resumen">
      <h3>
        Un poco <span>sobre mí...</span>
      </h3>
      <div className="contenedor-descripcion">
        <img src={resumen.portada} alt="portada-resumen" />
        <span className="descripcion">{resumen.descripcion}</span>
      </div>
    </div>
  );
}

export default Resumen;
