import './Avatar.css';

interface AvatarProps {
  readonly src: string;
  readonly name1: string;
  readonly name2: string;
  readonly nameIcon: string;
  readonly role: string;
}

function Avatar({ src, name1, name2, nameIcon, role }: Readonly<AvatarProps>) {
  return (
    <section id="avatar">
      <div className="avatar-picture">
        <img src={src} alt="avatar" />
      </div>
      <div className="avatar-content-text">
        <h3 className="avatar-title">
          <img src={nameIcon} alt="tech-ico" width="11%" />
          <span>{name1}</span>
          {name2}
        </h3>
        <span className="avatar-role">{role}</span>
      </div>
    </section>
  );
}

export default Avatar;
