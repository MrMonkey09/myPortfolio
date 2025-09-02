/* eslint-disable react/prop-types */
import { useState } from 'react';
import SelectorTipoFormulario from "./SelectorTipoFormulario";
import './FormularioContacto.css';

function FormularioContacto({ Conf }) {
  const [formData, setFormData] = useState({});

  const handleChange = (campo, valor) => {
    setFormData(prev => ({
      ...prev,
      [campo]: valor
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos del formulario:', formData);
  };

  let formulario = Object.keys(Conf);

  return (
    <form onSubmit={handleSubmit} className="formulario-contacto">
      {formulario.map((campo) => {
        const campoConfig = Conf[campo];
        return (
          <div key={campoConfig.id ?? 0} className="campo-formulario">
            <label htmlFor={campo}>{campoConfig.label || campo}</label>
            {SelectorTipoFormulario(
              campoConfig, 
              campo, 
              {},
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
