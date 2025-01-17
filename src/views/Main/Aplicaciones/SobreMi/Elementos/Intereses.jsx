/* eslint-disable react/prop-types */
import TarjetasDestacadas from "@utilities/Elementos/TarjetasDestacadas";
import Estilo from "../Estilo";
const estilo = Estilo.enLinea.intereses;

function Intereses({ intereses }) {
  return (
    <div style={estilo} id="intereses">
      <h3>
        Intereses <span>personales</span>
      </h3>
      <TarjetasDestacadas Conf={intereses} CustomStyle={{}} />
    </div>
  );
}

export default Intereses;
