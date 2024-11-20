import EstiloMenuApp from "../../BarraLateral/MenuApp/EstiloMenuApp";
import SobreMi from "./SobreMi";

const SobreMiInfo = {
  ID: "001",
  nombre: "Sobre mí",
  icono: (
    <svg
      id="001"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      style={EstiloMenuApp.estilos.aplicacion.img}
    >
      <path
        id="001"
        d="M560-440h200v-80H560v80Zm0-120h200v-80H560v80ZM200-320h320v-22q0-45-44-71.5T360-440q-72 0-116 26.5T200-342v22Zm160-160q33 0 56.5-23.5T440-560q0-33-23.5-56.5T360-640q-33 0-56.5 23.5T280-560q0 33 23.5 56.5T360-480ZM160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h640q33 0 56.5 23.5T880-720v480q0 33-23.5 56.5T800-160H160Zm0-80h640v-480H160v480Zm0 0v-480 480Z"
      />
    </svg>
  ),
  contenido: <SobreMi />,
};

export default SobreMiInfo;