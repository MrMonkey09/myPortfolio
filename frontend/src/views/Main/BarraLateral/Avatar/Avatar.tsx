import './Avatar.css';
import type { AvatarProps } from '../../../../types';

function Avatar({ src, name1, name2, nameIcon, role }: Readonly<AvatarProps>) {
  return (
    <section id="avatar">
      <div className="avatar-picture">
        {/* Explicit width/height for CLS prevention - using 180px max from CSS as intrinsic size */}
        <img src={src} alt="avatar" width="180" height="180" loading="eager" decoding="sync" />
      </div>
      <div className="avatar-content-text">
        <h3 className="avatar-title">
          <img src={nameIcon} alt="tech-ico" width="11%" decoding="async" />
          <span>{name1}</span>
          {name2}
        </h3>
        <span className="avatar-role">{role}</span>
      </div>
    </section>
  );
}

export default Avatar;
