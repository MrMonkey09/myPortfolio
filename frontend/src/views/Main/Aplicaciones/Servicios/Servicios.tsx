import { useState } from "react";
import Encabezado from "@utilities/Elementos/Encabezado/Encabezado";
import Configuracion from "./Configuracion";
import { useContactoNavegacion } from "../../ContactoNavegacionContext";
import "./Estilos.css";

function Servicios() {
  const { irAContactoConServicio } = useContactoNavegacion();
  const { servicios } = Configuracion.contenido;
  const [categoriaActiva, setCategoriaActiva] = useState(0);
  const cat = servicios[categoriaActiva];

  return (
    <>
      <Encabezado encabezado={Configuracion.contenido.encabezado} />
      <section className="servicios-section section-fade-in">
        {/* Navigation pills */}
        <nav
          className="servicios-nav mask-horizontal"
          aria-label="Categorías de servicios"
        >
          {servicios.map((cat, idx) => (
            <button
              key={cat.id}
              className={`servicios-nav-pill ${idx === categoriaActiva ? "servicios-nav-pill--active" : ""}`}
              onClick={() => setCategoriaActiva(idx)}
              type="button"
              title={cat.titulo}
              aria-current={idx === categoriaActiva ? "true" : undefined}
            >
              <span className="servicios-nav-pill__icon">{cat.icono}</span>
              <span className="servicios-nav-pill__text">{cat.titulo}</span>
            </button>
          ))}
        </nav>

        {/* Active category content */}
        <div className="servicios-content">
          <header className="servicios-content__header">
            <h3 className="servicios-content__title">
              {cat.icono} {cat.titulo}
            </h3>
            <p className="servicios-content__subtitle">{cat.subtitulo}</p>
          </header>

          <div className="servicios-planes-grid">
            {cat.planes.map((plan, idx) => (
              <article
                key={`${cat.id}-${idx}`}
                className={`servicio-plan-card ${plan.destacado ? "servicio-plan-card--destacado" : ""}`}
              >
                {plan.etiqueta && (
                  <span className="servicio-plan-card__badge">
                    {plan.etiqueta}
                  </span>
                )}
                <h4 className="servicio-plan-card__nombre">{plan.nombre}</h4>
                <p className="servicio-plan-card__precio">{plan.precio}</p>
                <ul className="servicio-plan-card__features">
                  {plan.caracteristicas.map((feat, i) => (
                    <li key={i} className="servicio-plan-card__feature">
                      <span className="servicio-plan-card__check">✓</span>
                      {feat}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="servicio-plan-card__cta"
                  onClick={() =>
                    irAContactoConServicio(`${cat.titulo} — ${plan.nombre}`)
                  }
                >
                  Consultar este plan
                </button>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

export default Servicios;
