import type { ReactNode, ChangeEvent } from "react";
import type { CampoFormulario } from "../../../types";

function SelectorTipoFormulario(
  campo: CampoFormulario,
  nombreCampo: string,
  value: string,
  onChange: (value: string) => void
): ReactNode {
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    onChange(e.target.value);
  };

  switch (campo.tipo) {
    case "seleccion":
      return (
        <select
          className="campo-formulario-select"
          name={nombreCampo}
          id={String(campo.id)}
          value={value}
          onChange={handleChange}
          required={campo.requerido || false}
          title={campo.ayuda}
        >
          {(campo.opciones ?? []).map((opt, i) => (
            <option key={`${opt.value}-${i}`} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    case "texto":
      return (
        <input
          className="campo-formulario-input"
          type="text"
          placeholder={campo.ejemplo}
          title={campo.ayuda}
          name={nombreCampo}
          id={String(campo.id)}
          value={value}
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
          value={value}
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
          value={value}
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
          value={value}
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
          value={value}
          onChange={handleChange}
          required={campo.requerido || false}
        />
      );
    default:
      return null;
  }
}

export default SelectorTipoFormulario;

