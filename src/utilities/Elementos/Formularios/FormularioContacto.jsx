/* eslint-disable react/prop-types */

import SelectorTipoFormulario from "./SelectorTipoFormulario";

function FormularioContacto({ Conf, CustomStyle }) {
  let formulario = Object.keys(Conf);
  return (
    <form style={CustomStyle}>
      {formulario.map((campo) => {
        return (
          <div key={Conf[campo].id ?? 0} style={CustomStyle?.contenedorCampo}>
            <img
              style={CustomStyle?.icono}
              src={Conf[campo].icono}
              alt="img-prueba"
            />
            {SelectorTipoFormulario(Conf[campo], campo, CustomStyle)}
          </div>
        );
      })}
    </form>
  );
}

export default FormularioContacto;
