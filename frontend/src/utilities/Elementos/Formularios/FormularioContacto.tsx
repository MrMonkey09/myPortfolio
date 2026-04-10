import { useState } from "react";
import SelectorTipoFormulario from "./SelectorTipoFormulario";
import "./FormularioContacto.css";
import type { CampoFormulario, FormData } from "../../../types";

interface FormularioContactoProps {
  readonly Conf: Record<string, CampoFormulario>;
  readonly enviarFormulario: (data: FormData) => void;
}

function FormularioContacto({ Conf, enviarFormulario }: Readonly<FormularioContactoProps>) {
  const [formData, setFormData] = useState({});

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
            <label htmlFor={campo}>{campoConfig.label || campo}</label>
            {SelectorTipoFormulario(campoConfig, campo, {}, (valor) =>
              handleChange(campo, valor)
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
