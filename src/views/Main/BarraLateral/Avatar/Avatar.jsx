import './Avatar.css';

function Avatar({ src, name1, name2, nameIcon, role }) {
  return (
    <section id="avatar">
      <div className="avatar-picture">
        <img src={src} alt="avatar" />
      </div>
      <h3 className="avatar-title">
        <img src={nameIcon} alt="tech-ico" width="11%" />
        <span>{name1}</span>
        {name2}
      </h3>
      <span className="avatar-role">{role}</span>
    </section>
  );
}

export default Avatar;
