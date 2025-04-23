/* eslint-disable react/prop-types */
import TarjetasDestacadas from "@utilities/Elementos/TarjetasDestacadas";
import Estilo from "../Estilo";
const estilo = Estilo.enLinea.intereses;

function Intereses({ intereses }) {
  return (
    <div style={estilo} id="intereses">
      <h3 style={estilo.titulo}>
        Intereses <span>personales</span>
      </h3>
      <TarjetasDestacadas Conf={intereses} CustomStyle={estilo.tarjetas} />
    </div>
  );
}

export default Intereses;
