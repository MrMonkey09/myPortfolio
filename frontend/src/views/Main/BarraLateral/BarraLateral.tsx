import './BarraLateral.css';
import Avatar from "./Avatar/Avatar";
import MenuApp from "./MenuApp/MenuApp";
import type { Aplicacion } from "../../../types";

interface BarraLateralProps {
  readonly setAplicacionActual: (app: Aplicacion) => void;
  readonly Aplicaciones: readonly Aplicacion[];
  readonly className?: string;
}

function BarraLateral({ setAplicacionActual, Aplicaciones, className }: Readonly<BarraLateralProps>) {
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
