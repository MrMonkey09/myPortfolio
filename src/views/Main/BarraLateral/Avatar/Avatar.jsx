/* eslint-disable react/prop-types */
import EstiloBarraLatareal from "../EstiloBarraLateral";
import EstiloAvatar from "./EstiloAvatar";

function Avatar({ src, name1, name2, nameIcon, role }) {
  return (
    <section id="avatar" style={EstiloBarraLatareal.estilos.avatar}>
      <div style={EstiloAvatar.estilos.picture}>
        <img
          style={EstiloAvatar.estilos.picture.img}
          src={src}
          alt="avatar"
        />
      </div>
      <h3 style={EstiloAvatar.estilos.h3}>
        <img src={nameIcon} alt="tech-ico" width="11%" />
        <span style={EstiloAvatar.estilos.h3.span}>{name1}</span>
        {name2}
      </h3>
      <span style={EstiloAvatar.estilos.span}>{role}</span>
    </section>
  );
}

export default Avatar;
