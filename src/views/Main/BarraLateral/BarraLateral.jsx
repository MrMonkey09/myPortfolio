import './BarraLateral.css';
import Avatar from "./Avatar/Avatar";
import MenuApp from "./MenuApp/MenuApp";
import Options from "./Options/Options";

function BarraLateral({ setAplicacionActual, Aplicaciones, className }) {
  return (
    <aside className={`barra-lateral ${className || ''}`} id="sidebar">
      <div className="avatar">
        <Avatar
          src={"https://avatars.githubusercontent.com/u/100534316?v=4"}
          name1="Mr"
          name2="Monkey"
          nameIcon="/assets/images/iconos/logo.svg"
          role="Desarrollador FullStack"
        />
      </div>
      <div className="menu-app">
        <MenuApp
          setAplicacionActual={setAplicacionActual}
          Aplicaciones={Aplicaciones}
        />
      </div>
    </aside>
  );
}
export default BarraLateral;
