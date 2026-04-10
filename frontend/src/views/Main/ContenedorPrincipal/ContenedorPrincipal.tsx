import type { ReactNode } from "react";
import "./ContenedorPrincipal.css";

interface ContenedorPrincipalProps {
  readonly children: ReactNode;
}

function ContenedorPrincipal({ children }: Readonly<ContenedorPrincipalProps>) {
  return (
    <main id="main-content" className="contenido-principal centrar-y">
      {children}
    </main>
  );
}

export default ContenedorPrincipal;
