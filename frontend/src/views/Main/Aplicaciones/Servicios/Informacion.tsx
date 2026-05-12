import { lazy } from "react";

const Servicios = lazy(() => import("./Servicios"));

const ServiciosInfo = {
  ID: "005",
  nombre: "Servicios",
  icono: (
    <svg
      id="005"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 -960 960 960"
      className="menu-app-icon"
    >
      <path
        id="005"
        d="M480-400q-17 0-28.5-11.5T440-440v-160q0-17 11.5-28.5T480-640q17 0 28.5 11.5T520-600v160q0 17-11.5 28.5T480-400Zm0 200q-17 0-28.5-11.5T440-240q0-17 11.5-28.5T480-280q17 0 28.5 11.5T520-240q0 17-11.5 28.5T480-200Zm0 120q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"
      />
    </svg>
  ),
  contenido: <Servicios />,
};

export default ServiciosInfo;