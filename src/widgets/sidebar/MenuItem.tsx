import { NavLink } from "react-router-dom";

export function MenuItem({
  icon,
  text,
  to,
  end,
  onNavigate,
}: {
  icon: string;
  text: string;
  to: string;
  end?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <NavLink to={to} end={end} onClick={onNavigate} className={({ isActive }) => `menu-item ${isActive ? "active" : ""}`}>
      <span className="icon">
        <span className="icon-img" style={{ ["--icon-url" as string]: `url(${icon})` }} />
      </span>
      <span className="text">{text}</span>
    </NavLink>
  );
}
