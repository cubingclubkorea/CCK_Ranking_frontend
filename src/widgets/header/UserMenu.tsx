import { useEffect, useRef, useState } from "react";

type UserMenuProps = {
  avatarInitial: string;
  name: string;
  cckId: string;
  onProfile: () => void;
  onSettings: () => void;
  onLogout: () => void;
};

export const UserMenu = ({ avatarInitial, name, cckId, onProfile, onSettings, onLogout }: UserMenuProps) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current || menuRef.current.contains(event.target as Node)) return;
      setMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleAction = (action: () => void) => {
    setMenuOpen(false);
    action();
  };

  return (
    <div className="header-user-dropdown" ref={menuRef}>
      <button
        type="button"
        className="avatar-btn"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        aria-label={`${name} 사용자 메뉴`}
        onClick={() => setMenuOpen((prev) => !prev)}
      >
        <span className="avatar-initial" aria-hidden="true">
          {avatarInitial}
        </span>
      </button>
      {menuOpen && (
        <div className="header-user-menu" role="menu">
          <div className="header-user-info">
            <div className="header-user-info-name">{name}</div>
            {cckId && <div className="header-user-info-id">{cckId}</div>}
          </div>
          <button
            type="button"
            className="header-user-menu-item"
            role="menuitem"
            onClick={() => handleAction(onProfile)}
          >
            나의 정보
          </button>
          <button
            type="button"
            className="header-user-menu-item"
            role="menuitem"
            onClick={() => handleAction(onSettings)}
          >
            계정 설정
          </button>
          <button
            type="button"
            className="header-user-menu-item header-user-menu-item--danger"
            role="menuitem"
            onClick={() => handleAction(onLogout)}
          >
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
};
