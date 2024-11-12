/* eslint-disable react/prop-types */
import EstiloPrincipal from "../EstiloPrincipal";
import Avatar from "./Avatar/Avatar";
import MenuApp from "./MenuApp/MenuApp";
import Options from "./Options/Options";

function BarraLateral({ setAplicacionActual, Aplicaciones }) {
  return (
    <aside style={EstiloPrincipal.enLinea.barraLateral} id="sidebar">
      <Avatar
        src={"https://avatars.githubusercontent.com/u/100534316?v=4"}
        name1="Mr"
        name2="Monkey"
        nameIcon="https://ryanbalieiro.github.io/react-portfolio-template/images/svg/logo.svg"
        role="Desarrollador FullStack"
      />
      <MenuApp setAplicacionActual={setAplicacionActual} Aplicaciones={Aplicaciones} />
      <Options />
    </aside>
  );
}
export default BarraLateral;
