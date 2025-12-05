function SelectorTipoFormulario(campo, nombreCampo, CustomStyle, onChange) {
  const handleChange = (e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  };

  switch (campo.tipo) {
    case "texto":
      return (
        <input
          className="campo-formulario-input"
          type="text"
          placeholder={campo.ejemplo}
          enterKeyHint={campo.ayuda}
          name={nombreCampo}
          id={campo.id}
          onChange={handleChange}
          required={campo.requerido || false}
        />
      );
    case "cajaTexto":
      return (
        <textarea
          className="campo-formulario-textarea"
          placeholder={campo.ejemplo}
          enterKeyHint={campo.ayuda}
          name={nombreCampo}
          id={campo.id}
          rows={4}
          onChange={handleChange}
          required={campo.requerido || false}
        />
      );
    case "numero":
      return (
        <input
          className="campo-formulario-input"
          type="number"
          name={nombreCampo}
          placeholder={campo.ejemplo}
          id={campo.id}
          onChange={handleChange}
          required={campo.requerido || false}
        />
      );
    case "correo":
      return (
        <input
          className="campo-formulario-input"
          type="email"
          name={nombreCampo}
          placeholder={campo.ejemplo}
          id={campo.id}
          onChange={handleChange}
          required={campo.requerido || false}
        />
      );
    case "enlace":
      return (
        <input
          className="campo-formulario-input"
          type="url"
          name={nombreCampo}
          placeholder={campo.ejemplo}
          id={campo.id}
          onChange={handleChange}
          required={campo.requerido || false}
        />
      );
    default:
      return null;
  }
}

export default SelectorTipoFormulario;

