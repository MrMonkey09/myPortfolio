function TarjetasIncrustadas2({Configuracion}) {
  return Configuracion.contenido.proyectos.map((proyecto) => (
    <article key={proyecto.id} className="proyecto-card">
      <img
        src={proyecto.imagen}
        alt={proyecto.titulo}
        className="proyecto-imagen"
      />
      <h3 className="proyecto-titulo">{proyecto.titulo}</h3>
      <p className="proyecto-descripcion">{proyecto.descripcion}</p>
      <div className="proyecto-tecnologias">
        {proyecto.tecnologias.map((tec, index) => (
          <span key={index} className="tecnologia">
            {tec}
          </span>
        ))}
      </div>
      <a
        href={proyecto.enlace}
        target="_blank"
        rel="noopener noreferrer"
        className="proyecto-enlace"
      >
        Ver Proyecto
      </a>
    </article>
  ));
}

export default TarjetasIncrustadas2;
