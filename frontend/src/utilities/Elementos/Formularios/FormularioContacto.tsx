import { useEffect, useState } from "react";
import SelectorTipoFormulario from "./SelectorTipoFormulario";
import "./FormularioContacto.css";
import type { CampoFormulario, FormData } from "../../../types";

const CAMPO_SERVICIO = "Servicio de interés";

interface FormularioContactoProps {
  readonly Conf: Record<string, CampoFormulario>;
  readonly enviarFormulario: (data: FormData) => void;
  /** Texto del plan elegido en catálogo; vacío si el usuario entró por el menú. */
  readonly presetServicioDesdeCatalogo?: string;
}

function FormularioContacto({
  Conf,
  enviarFormulario,
  presetServicioDesdeCatalogo = "",
}: Readonly<FormularioContactoProps>) {
  const [formData, setFormData] = useState<FormData>(() =>
    presetServicioDesdeCatalogo
      ? { [CAMPO_SERVICIO]: presetServicioDesdeCatalogo }
      : {}
  );

  useEffect(() => {
    if (!presetServicioDesdeCatalogo) {
      setFormData((prev) => {
        if (!prev[CAMPO_SERVICIO]) return prev;
        return { ...prev, [CAMPO_SERVICIO]: "" };
      });
      return;
    }
    setFormData((prev) => {
      if (prev[CAMPO_SERVICIO] === presetServicioDesdeCatalogo) return prev;
      return { ...prev, [CAMPO_SERVICIO]: presetServicioDesdeCatalogo };
    });
  }, [presetServicioDesdeCatalogo]);

  const handleChange = (campo: string, valor: string) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    enviarFormulario(formData);
  };

  const formulario = Object.keys(Conf);

  return (
    <form onSubmit={handleSubmit} className="formulario-contacto">
      {formulario.map((campo) => {
        const campoConfig = Conf[campo];
        return (
          <div key={campoConfig.id ?? 0} className="campo-formulario">
            <label htmlFor={String(campoConfig.id)}>{campoConfig.label || campo}</label>
            {SelectorTipoFormulario(
              campoConfig,
              campo,
              formData[campo] ?? "",
              (valor) => handleChange(campo, valor)
            )}
          </div>
        );
      })}
      <button type="submit" className="boton-enviar">
        Enviar Mensaje
      </button>
    </form>
  );
}

export default FormularioContacto;
