import "./MenuApp.css";
import type { Aplicacion } from "../../../../types";
import type { MouseEvent } from "react";

interface MenuAppProps {
  readonly setAplicacionActual: (app: Aplicacion) => void;
  readonly Aplicaciones: readonly Aplicacion[];
}

function MenuApp({ setAplicacionActual, Aplicaciones }: Readonly<MenuAppProps>) {
  function goTo(e: MouseEvent<HTMLLIElement>) {
    const targetId = (e.currentTarget as HTMLElement).id;
    Aplicaciones.forEach((aplicacion) => {
      if (aplicacion.ID === targetId) {
        setAplicacionActual(aplicacion);
      }
    });
  }
  
  return (
    <ul id="menu-app">
      {Aplicaciones.map((aplicacion) => (
        <li
          key={aplicacion["ID"]}
          id={aplicacion["ID"]}
          className="menu-app-item"
          onClick={goTo}
        >
          {aplicacion.icono}
          <span id={aplicacion["ID"]}>
            {aplicacion["nombre"]}
          </span>
        </li>
      ))}
    </ul>
  );
}

export default MenuApp;
