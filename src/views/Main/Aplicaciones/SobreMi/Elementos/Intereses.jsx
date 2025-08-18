import "./Intereses.css";
import TarjetasDestacadas from "@utilities/Elementos/TarjetasDestacadas";

function Intereses({ intereses }) {
  return (
    <div id="intereses">
      <h3>
        Intereses <span>personales</span>
      </h3>
      <TarjetasDestacadas Conf={intereses} />
    </div>
  );
}
export default Intereses;
