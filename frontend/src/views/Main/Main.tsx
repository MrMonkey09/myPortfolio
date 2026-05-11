import { useEffect, useState } from "react";
import BarraLateral from "./BarraLateral/BarraLateral";
import ContenedorPrincipal from "./ContenedorPrincipal/ContenedorPrincipal";
import "./Main.css";
import Router from "./Router";
import Aplicaciones from "./Aplicaciones/Aplicaciones";
import {
  applySeoForSection,
  getSeoSectionByAppId,
  getSeoSectionByPath,
  SEO_SECTIONS,
} from "@utilities/seo/seo";
import {
  ContactoNavegacionProvider,
  useContactoNavegacion,
} from "./ContactoNavegacionContext";

import type { ReactNode } from "react";

function MainLayout(): ReactNode {
  const { aplicacionActual, setAplicacionDesdeMenu } = useContactoNavegacion();
  const [menuMobileOpen, setMenuMobileOpen] = useState(false);
  const [rutaInicialSincronizada, setRutaInicialSincronizada] = useState(false);

  useEffect(() => {
    const seoInicial = getSeoSectionByPath(window.location.pathname);
    if (!seoInicial) {
      setRutaInicialSincronizada(true);
      return;
    }

    const appInicial = Aplicaciones.find((app) => app.ID === seoInicial.appId);
    if (appInicial) {
      setAplicacionDesdeMenu(appInicial);
    }

    setRutaInicialSincronizada(true);
  }, [setAplicacionDesdeMenu]);

  useEffect(() => {
    const onPopState = () => {
      const seoSection = getSeoSectionByPath(window.location.pathname);
      if (!seoSection) return;

      const app = Aplicaciones.find((candidate) => candidate.ID === seoSection.appId);
      if (app) {
        setAplicacionDesdeMenu(app);
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [setAplicacionDesdeMenu]);

  useEffect(() => {
    setMenuMobileOpen(false);
  }, [aplicacionActual]);

  useEffect(() => {
    if (!rutaInicialSincronizada) return;

    const seoSection =
      getSeoSectionByAppId(aplicacionActual.ID) ?? SEO_SECTIONS[0];

    applySeoForSection(seoSection);

    if (window.location.pathname !== seoSection.path) {
      window.history.pushState(
        { appId: seoSection.appId },
        "",
        seoSection.path
      );
    }
  }, [aplicacionActual.ID, rutaInicialSincronizada]);

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
