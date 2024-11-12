/* eslint-disable react/prop-types */
import EstiloBarraLatareal from "../EstiloBarraLateral";
import EstiloMenuApp from "./EstiloMenuApp";
import "./MenuApp.css";

function MenuApp({ setAplicacionActual, Aplicaciones }) {
  function goTo(e) {
    Aplicaciones.forEach((aplicacion) => {
      if (aplicacion.ID === e.target.id) {
        console.log("encontrado: " + aplicacion.nombre);
        setAplicacionActual(aplicacion);
      }
    });
  }
  
  return (
    <ul id="menu-app" style={EstiloBarraLatareal.estilos.menuApp}>
      {Aplicaciones.map((aplicacion) => {
        return (
          <li
            key={aplicacion["ID"]}
            id={aplicacion["ID"]}
            style={EstiloMenuApp.estilos.aplicacion}
            onClick={goTo}
          >
            {aplicacion.icono}
            <span
              style={EstiloMenuApp.estilos.aplicacion.span}
              id={aplicacion["ID"]}
            >
              {aplicacion["nombre"]}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

export default MenuApp;
