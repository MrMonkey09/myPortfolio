import { useState } from "react";
import BarraLateral from "./BarraLateral/BarraLateral";
import ContenedorPrincipal from "./ContenedorPrincipal/ContenedorPrincipal";
import "./Main.css";
import Router from "./Router";
import Aplicaciones from "./Aplicaciones/Aplicaciones";

function Main() {
  const [aplicacionActual, setAplicacionActual] = useState(Aplicaciones[0]);
  const [menuMobileOpen, setMenuMobileOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMenuMobileOpen(!menuMobileOpen);
  };



  return (
    <>
      <button
        className={`menu-mobile-toggle ${menuMobileOpen ? "open" : ""}`}
        onClick={toggleMobileMenu}
        aria-label="Abrir menú"
      >
        <span className="arrow-icon"></span>
      </button>
      <div
        className={menuMobileOpen ? "overlay-menu" : "overlay-menu-none"}
        onClick={() => setMenuMobileOpen(false)}
      ></div>
      <BarraLateral
        className={menuMobileOpen ? "open" : ""}
        setAplicacionActual={(app) => {
          setAplicacionActual(app);
          setMenuMobileOpen(false);
        }}
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
