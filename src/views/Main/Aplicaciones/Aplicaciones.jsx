import EstiloMenuApp from "../BarraLateral/MenuApp/EstiloMenuApp";
import EstiloPrincipal from "../EstiloPrincipal";
import SobreMi from "./SobreMi/SobreMi";

const Aplicaciones = [
  {
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
    contenido: (
      <SobreMi
        encabezado={{
          saludo: "Hola...",
          nombre: "Mr Monkey",
          datos: {
            ciudad: "Antofagasta, Chile",
            correo: "alfredoa_gestay@outlook.com",
            github: "MrMonkey09",
          },
        }}
      />
    ),
  },
  {
    ID: "002",
    nombre: "Educación",
    icono: (
      <svg
        id="002"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 -960 960 960"
        style={EstiloMenuApp.estilos.aplicacion.img}
      >
        <path
          id="002"
          d="M480-120 200-272v-240L40-600l440-240 440 240v320h-80v-276l-80 44v240L480-120Zm0-332 274-148-274-148-274 148 274 148Zm0 241 200-108v-151L480-360 280-470v151l200 108Zm0-241Zm0 90Zm0 0Z"
        />
      </svg>
    ),
    contenido: (
      <section style={EstiloPrincipal.enLinea.subContenedor}>Educacion</section>
    ),
  },
  {
    ID: "003",
    nombre: "Habilidades",
    icono: (
      <svg
        id="003"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 -960 960 960"
        style={EstiloMenuApp.estilos.aplicacion.img}
      >
        <path
          id="003"
          d="M754-81q-8 0-15-2.5T726-92L522-296q-6-6-8.5-13t-2.5-15q0-8 2.5-15t8.5-13l85-85q6-6 13-8.5t15-2.5q8 0 15 2.5t13 8.5l204 204q6 6 8.5 13t2.5 15q0 8-2.5 15t-8.5 13l-85 85q-6 6-13 8.5T754-81Zm0-95 29-29-147-147-29 29 147 147ZM205-80q-8 0-15.5-3T176-92l-84-84q-6-6-9-13.5T80-205q0-8 3-15t9-13l212-212h85l34-34-165-165h-57L80-765l113-113 121 121v57l165 165 116-116-43-43 56-56H495l-28-28 142-142 28 28v113l56-56 142 142q17 17 26 38.5t9 45.5q0 24-9 46t-26 39l-85-85-56 56-42-42-207 207v84L233-92q-6 6-13 9t-15 3Zm0-96 170-170v-29h-29L176-205l29 29Zm0 0-29-29 15 14 14 15Zm549 0 29-29-29 29Z"
        />
      </svg>
    ),
    contenido: (
      <section style={EstiloPrincipal.enLinea.subContenedor}>
        Habilidades
      </section>
    ),
  },
  {
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
    contenido: (
      <section style={EstiloPrincipal.enLinea.subContenedor}>
        Experiencia
      </section>
    ),
  },
  {
    ID: "005",
    nombre: "Proyectos",
    icono: (
      <svg
        id="005"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 -960 960 960"
        style={EstiloMenuApp.estilos.aplicacion.img}
      >
        <path
          id="005"
          d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h240l80 80h320q33 0 56.5 23.5T880-640H447l-80-80H160v480l96-320h684L837-217q-8 26-29.5 41.5T760-160H160Zm84-80h516l72-240H316l-72 240Zm0 0 72-240-72 240Zm-84-400v-80 80Z"
        />
      </svg>
    ),
    contenido: (
      <section style={EstiloPrincipal.enLinea.subContenedor}>Proyectos</section>
    ),
  },
  {
    ID: "006",
    nombre: "Logros",
    icono: (
      <svg
        id="006"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 -960 960 960"
        style={EstiloMenuApp.estilos.aplicacion.img}
      >
        <path
          id="006"
          d="m387-412 35-114-92-74h114l36-112 36 112h114l-93 74 35 114-92-71-93 71ZM240-40v-309q-38-42-59-96t-21-115q0-134 93-227t227-93q134 0 227 93t93 227q0 61-21 115t-59 96v309l-240-80-240 80Zm240-280q100 0 170-70t70-170q0-100-70-170t-170-70q-100 0-170 70t-70 170q0 100 70 170t170 70ZM320-159l160-41 160 41v-124q-35 20-75.5 31.5T480-240q-44 0-84.5-11.5T320-283v124Zm160-62Z"
        />
      </svg>
    ),
    contenido: (
      <section style={EstiloPrincipal.enLinea.subContenedor}>Logros</section>
    ),
  },
  {
    ID: "007",
    nombre: "Actualizaciones",
    icono: (
      <svg
        id="007"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 -960 960 960"
        style={EstiloMenuApp.estilos.aplicacion.img}
      >
        <path
          id="007"
          d="M200-120q-33 0-56.5-23.5T120-200q0-33 23.5-56.5T200-280q33 0 56.5 23.5T280-200q0 33-23.5 56.5T200-120Zm480 0q0-117-44-218.5T516-516q-76-76-177.5-120T120-680v-120q142 0 265 53t216 146q93 93 146 216t53 265H680Zm-240 0q0-67-25-124.5T346-346q-44-44-101.5-69T120-440v-120q92 0 171.5 34.5T431-431q60 60 94.5 139.5T560-120H440Z"
        />
      </svg>
    ),
    contenido: (
      <section style={EstiloPrincipal.enLinea.subContenedor}>
        Actualizaciones
      </section>
    ),
  },
  {
    ID: "008",
    nombre: "Contacto",
    icono: (
      <svg
        id="008"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 -960 960 960"
        style={EstiloMenuApp.estilos.aplicacion.img}
      >
        <path
          id="008"
          d="m490-527 37 37 217-217-37-37-217 217ZM200-200h37l233-233-37-37-233 233v37Zm355-205L405-555l167-167-29-29-219 219-56-56 218-219q24-24 56.5-24t56.5 24l29 29 50-50q12-12 28.5-12t28.5 12l93 93q12 12 12 28.5T828-678L555-405ZM270-120H120v-150l285-285 150 150-285 285Z"
        />
      </svg>
    ),
    contenido: (
      <section style={EstiloPrincipal.enLinea.subContenedor}>Contacto</section>
    ),
  },
];

export default Aplicaciones;
