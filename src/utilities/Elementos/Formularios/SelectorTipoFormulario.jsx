function SelectorTipoFormulario(campo, nombre, CustomStyle) {
  switch (campo.tipo) {
    case "texto":
      return (
        <>
          <label htmlFor={campo.id}>{nombre}</label>
          <input
            type="text"
            placeholder={campo.ejemplo}
            enterKeyHint={campo.ayuda}
            name={nombre}
            id={campo.id}
            style={CustomStyle?.campoTexto}
          />
        </>
      );
    case "numero":
      return (
        <>
          <label htmlFor={campo.id}>{nombre}</label>
          <input
            type="number"
            name={nombre}
            placeholder={campo.ejemplo}
            id={campo.id}
            style={CustomStyle?.campoNumero}
          />
        </>
      );
    case "correo":
      return (
        <>
          <label htmlFor={campo.id}>{nombre}</label>
          <input
            type="email"
            name={nombre}
            placeholder={campo.ejemplo}
            id={campo.id}
            style={CustomStyle?.campoCorreo}
          />
        </>
      );
    case "enlace":
      return (
        <>
          <label htmlFor={campo.id}>{nombre}</label>
          <input
            type="url"
            name={nombre}
            placeholder={campo.ejemplo}
            id={campo.id}
          />
        </>
      );
    default:
      return;
  }
}

export default SelectorTipoFormulario;
