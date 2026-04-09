/* Aplicaciones */
import SobreMiInfo from "./SobreMi/Informacion";
import EducacionInfo from "./Educacion/Informacion";
import HabilidadesInfo from "./Habilidades/Informacion";
import ContactoInfo from "./Contacto/Informacion";
import ProyectosInfo from "./Proyectos/Informacion";

import type { Aplicacion } from "../../../types";

const Aplicaciones: readonly Aplicacion[] = [
  SobreMiInfo as Aplicacion,
  EducacionInfo as Aplicacion,
  HabilidadesInfo as Aplicacion,
  ContactoInfo as unknown as Aplicacion,
  ProyectosInfo as Aplicacion
];

export default Aplicaciones;
