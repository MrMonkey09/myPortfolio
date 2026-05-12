import "./Resumen.css";

interface ResumenProps {
  readonly resumen: {
    readonly portada: string;
    readonly descripcion: string;
  };
}

function Resumen({ resumen }: Readonly<ResumenProps>) {
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
