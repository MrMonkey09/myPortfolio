/* eslint-disable react/prop-types */
import EstiloPrincipal from "../EstiloPrincipal";

function ContenedorPrincipal({ children }) {
  return (
    <main style={EstiloPrincipal.enLinea.contenidoPrincipal} id="main-content" className="centrar-y">
      {children}
    </main>
  );
}

export default ContenedorPrincipal;
