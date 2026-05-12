import "./Intereses.css";
import CarruselInteresesInfinito from "./CarruselInteresesInfinito";
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
      <CarruselInteresesInfinito intereses={intereses} />
    </div>
  );
}
export default Intereses;
