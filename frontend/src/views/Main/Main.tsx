import { useEffect, useState } from "react";
import BarraLateral from "./BarraLateral/BarraLateral";
import ContenedorPrincipal from "./ContenedorPrincipal/ContenedorPrincipal";
import "./Main.css";
import Router from "./Router";
import Aplicaciones from "./Aplicaciones/Aplicaciones";
import {
  ContactoNavegacionProvider,
  useContactoNavegacion,
} from "./ContactoNavegacionContext";

import type { ReactNode } from "react";

function MainLayout(): ReactNode {
  const { aplicacionActual, setAplicacionDesdeMenu } = useContactoNavegacion();
  const [menuMobileOpen, setMenuMobileOpen] = useState(false);

  useEffect(() => {
    setMenuMobileOpen(false);
  }, [aplicacionActual]);

  const toggleMobileMenu = () => {
    setMenuMobileOpen(!menuMobileOpen);
  };

  return (
    <>
      <button
        type="button"
        className={`menu-mobile-toggle ${menuMobileOpen ? "open" : ""}`}
        onClick={toggleMobileMenu}
        aria-label={menuMobileOpen ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={menuMobileOpen}
      >
        <span className="arrow-icon"></span>
      </button>
      <div
        className={menuMobileOpen ? "overlay-menu" : "overlay-menu-none"}
        onClick={() => setMenuMobileOpen(false)}
      ></div>
      <div className="main-layout">
        <BarraLateral
          className={menuMobileOpen ? "open" : ""}
          setAplicacionActual={(app) => {
            setAplicacionDesdeMenu(app);
          }}
          Aplicaciones={Aplicaciones}
        />
        <ContenedorPrincipal>
          <section className="sub-contenedor">
            <Router aplicacionActual={aplicacionActual} />
          </section>
        </ContenedorPrincipal>
      </div>
    </>
  );
}

export default function Main(): ReactNode {
  return (
    <ContactoNavegacionProvider aplicaciones={Aplicaciones}>
      <MainLayout />
    </ContactoNavegacionProvider>
  );
}
