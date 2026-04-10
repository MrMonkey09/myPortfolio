import type { ReactNode } from "react";
import type { Aplicacion } from "../../types";

interface RouterProps {
  readonly aplicacionActual: Aplicacion;
}

function Router({ aplicacionActual }: Readonly<RouterProps>): ReactNode {
  return aplicacionActual.contenido;
}

export default Router;
