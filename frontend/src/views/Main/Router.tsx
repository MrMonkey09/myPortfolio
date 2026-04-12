import { Suspense, type ReactNode } from "react";
import type { Aplicacion } from "../../types";

interface RouterProps {
  readonly aplicacionActual: Aplicacion;
}

function Router({ aplicacionActual }: Readonly<RouterProps>): ReactNode {
  return (
    <Suspense fallback={<div className="loading-placeholder">Cargando...</div>}>
      {aplicacionActual.contenido}
    </Suspense>
  );
}

export default Router;
