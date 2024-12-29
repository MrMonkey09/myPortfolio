import Estilo from "../Estilo";

const estilo = Estilo.enLinea.intereses;

/* eslint-disable react/prop-types */
function Interes({ interes }) {
  return (
    <li className="tarjeta" style={estilo.tarjeta}>
      <img src={interes.icono} alt="icono-interes" width="50px" />
      <div id="contenido-tarjeta">
        <h4>{interes.nombre}</h4>
        <span>{interes.descripcion}</span>
      </div>
    </li>
  );
}

function Intereses({ intereses }) {
  return (
    <div id="intereses">
      <h3>
        Intereses <span>personales</span>
      </h3>
      <ul style={estilo}>
        {intereses.listado.map((interes) => {
          console.log(interes);
          return <Interes interes={interes} key={interes.id} />;
        })}
      </ul>
    </div>
  );
}

export default Intereses;
