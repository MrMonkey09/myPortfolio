import EstiloMenuApp from "../../BarraLateral/MenuApp/EstiloMenuApp";
import Experiencia from "./Experiencia";

const ExperienciaInfo = {
  ID: "004",
  nombre: "Experiencia",
  icono: (
    <svg
      id="004"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      style={EstiloMenuApp.estilos.aplicacion.img}
    >
      <path
        id="004"
        d="M480-400ZM80-160v-400q0-33 23.5-56.5T160-640h120v-80q0-33 23.5-56.5T360-800h240q33 0 56.5 23.5T680-720v80h120q33 0 56.5 23.5T880-560v400H80Zm240-200v40h-80v-40h-80v120h640v-120h-80v40h-80v-40H320ZM160-560v120h80v-40h80v40h320v-40h80v40h80v-120H160Zm200-80h240v-80H360v80Z"
      />
    </svg>
  ),
  contenido: <Experiencia />,
};

export default ExperienciaInfo;