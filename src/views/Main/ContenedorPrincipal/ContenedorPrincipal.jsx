/* eslint-disable react/prop-types */
import "./ContenedorPrincipal.css";

function ContenedorPrincipal({ children }) {
  return (
    <main id="main-content" className="contenido-principal centrar-y">
      {children}
    </main>
  );
}

export default ContenedorPrincipal;
