import "./MenuApp.css";

function MenuApp({ setAplicacionActual, Aplicaciones }) {
  function goTo(e) {
    Aplicaciones.forEach((aplicacion) => {
      if (aplicacion.ID === e.target.id) {
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
