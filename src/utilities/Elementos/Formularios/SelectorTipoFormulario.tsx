import type { ReactNode, ChangeEvent } from "react";
import type { CampoFormulario } from "../../../types";

function SelectorTipoFormulario(
  campo: CampoFormulario,
  nombreCampo: string,
  CustomStyle: Record<string, unknown>,
  onChange: (value: string) => void
): ReactNode {
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
          title={campo.ayuda}
          name={nombreCampo}
          id={String(campo.id)}
          onChange={handleChange}
          required={campo.requerido || false}
        />
      );
    case "cajaTexto":
      return (
        <textarea
          className="campo-formulario-textarea"
          placeholder={campo.ejemplo}
          title={campo.ayuda}
          name={nombreCampo}
          id={String(campo.id)}
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
          id={String(campo.id)}
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
          id={String(campo.id)}
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
          id={String(campo.id)}
          onChange={handleChange}
          required={campo.requerido || false}
        />
      );
    default:
      return null;
  }
}

export default SelectorTipoFormulario;

