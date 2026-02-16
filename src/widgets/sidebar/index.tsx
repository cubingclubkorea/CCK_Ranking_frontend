import { useEffect, useState } from "react";
import { MenuItem } from "./MenuItem";
import { authChangeEvent, getAuthUserProfile, hasAccessToken, hasAdminRole } from "@/features/auth/utils/tokenStorage";

type SidebarProps = {
  collapsed: boolean;
  isMobile: boolean;
  mobileOpen: boolean;
  onClose: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
};

function Sidebar({ collapsed, isMobile, mobileOpen, onClose, theme, onToggleTheme }: SidebarProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(hasAccessToken());
  const [isAdmin, setIsAdmin] = useState(hasAdminRole());
  const [myCckId, setMyCckId] = useState(getAuthUserProfile()?.cckId ?? "");
  const isDark = theme === "dark";
  const icons = {
    list: "/icon/sidebar/list.svg",
    record: "/icon/sidebar/record.svg",
    trophy: "/icon/sidebar/trophy.svg",
    person: "/icon/sidebar/person.svg",
    personData: "/icon/sidebar/person-data.svg",
    pencil: "/icon/sidebar/pencil.svg",
    cube: "/icon/sidebar/cube.svg",
    card: "/icon/sidebar/card.svg",
    lock: "/icon/sidebar/lock.svg",
    form: "/icon/sidebar/form.svg",
    dashboard: "/icon/sidebar/dashboard.svg",
  };

  useEffect(() => {
    const syncAuthState = () => {
      setIsLoggedIn(hasAccessToken());
      setIsAdmin(hasAdminRole());
      setMyCckId(getAuthUserProfile()?.cckId ?? "");
    };
    window.addEventListener(authChangeEvent, syncAuthState);
    window.addEventListener("storage", syncAuthState);
    return () => {
      window.removeEventListener(authChangeEvent, syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  return (
    <>
      {isMobile && mobileOpen && <button type="button" className="sidebar-backdrop" onClick={onClose} aria-label="메뉴 닫기" />}
      <aside className={`sidebar ${collapsed ? "collapsed" : ""} ${isMobile ? "mobile" : ""} ${isMobile && mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-content">
          {/* 일반 메뉴 */}
          <div className="menu-group">
            <MenuItem text="대회 목록" icon={icons.list} to="/" onNavigate={isMobile ? onClose : undefined} />
            <MenuItem text="신기록" icon={icons.record} to="/record" onNavigate={isMobile ? onClose : undefined} />
            <MenuItem text="랭킹" icon={icons.trophy} to="/ranking" onNavigate={isMobile ? onClose : undefined} />
            {isLoggedIn && <MenuItem text="나의 정보" icon={icons.person} to={myCckId ? `/profile/${encodeURIComponent(myCckId)}` : "/profile"} onNavigate={isMobile ? onClose : undefined} />}
            {isLoggedIn && <MenuItem text="기록 이전 신청" icon={icons.form} to="/transfer-record" onNavigate={isMobile ? onClose : undefined} />}
          </div>

          {isAdmin && (
            <>
              <div className="sidebar-divider" />

              {/* 관리자 메뉴 */}
              <div className="admin-group">
                <MenuItem text="대회 관리" icon={icons.pencil} to="/admin/competition" onNavigate={isMobile ? onClose : undefined} />
                <MenuItem text="큐브 종목 관리" icon={icons.cube} to="/admin/event" onNavigate={isMobile ? onClose : undefined} />
                <MenuItem text="API 대시보드" icon={icons.dashboard} to="/admin/api-dashboard" onNavigate={isMobile ? onClose : undefined} />
              </div>
            </>
          )}
        </div>

        <div className="sidebar-footer">
          <button
            type="button"
            className={`sidebar-theme-toggle ${isDark ? "sidebar-theme-toggle--dark" : ""}`}
            onClick={onToggleTheme}
            aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
            title={isDark ? "라이트 모드" : "다크 모드"}
          >
            <img
              className="theme-toggle-icon-img"
              src={isDark ? "/icon/header/theme-light.svg" : "/icon/header/theme-dark.svg"}
              alt=""
              aria-hidden="true"
            />
            <span className="sidebar-theme-toggle-text">{isDark ? "라이트 모드" : "다크 모드"}</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
