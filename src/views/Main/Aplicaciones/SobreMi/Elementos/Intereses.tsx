import "./Intereses.css";
import TarjetasDestacadas from "@utilities/Elementos/TarjetasDestacadas";
import type { Tarjeta } from "../../../../../types";

interface InteresesProps {
  readonly intereses: readonly Tarjeta[];
}

function Intereses({ intereses }: Readonly<InteresesProps>) {
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
