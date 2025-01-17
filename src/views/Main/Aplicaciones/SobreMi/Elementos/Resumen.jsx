import Estilo from "../Estilo";
const estilo = Estilo.enLinea.resumen;

/* eslint-disable react/prop-types */
function Resumen({ resumen }) {
  console.log(resumen);
  return (
    <div id="resumen" style={estilo}>
      <h3 style={estilo.titulo}>
        Un poco <span>sobre mí...</span>
      </h3>
      <div style={estilo.contenedorDescripcion}>
        <img
          style={estilo.contenedorDescripcion.imagen}
          src={resumen.portada}
          alt="portada-resumen"
        />
        <span style={estilo.contenedorDescripcion.descripcion}>
          {resumen.descripcion}
        </span>
      </div>
    </div>
  );
}

export default Resumen;
