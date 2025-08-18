import { useState } from "react";
import BarraLateral from "./BarraLateral/BarraLateral";
import ContenedorPrincipal from "./ContenedorPrincipal/ContenedorPrincipal";
import "./Main.css";
import Router from "./Router";
import Aplicaciones from "./Aplicaciones/Aplicaciones";

function Main() {
  const [aplicacionActual, setAplicacionActual] = useState(Aplicaciones[0]);

  return (
    <>
      <BarraLateral
        setAplicacionActual={setAplicacionActual}
        Aplicaciones={Aplicaciones}
      />
      <ContenedorPrincipal>
        <section className="sub-contenedor">
          <Router aplicacionActual={aplicacionActual} />
        </section>
      </ContenedorPrincipal>
    </>
  );
}

export default Main;
