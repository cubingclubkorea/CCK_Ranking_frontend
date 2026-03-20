import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthInfo } from "@/entities/authInfo";
import { logout } from "@/features/auth";
import { authChangeEvent, getAccessToken, getAuthUserProfile } from "@/features/auth/utils/tokenStorage";
import { UserMenu } from "./UserMenu";

function Header({
  collapsed,
  onToggle,
  theme,
  isMobile,
  mobileMenuOpen,
}: {
  collapsed: boolean;
  onToggle: () => void;
  theme: "light" | "dark";
  isMobile: boolean;
  mobileMenuOpen: boolean;
}) {
  const navigate = useNavigate();
  const [token, setToken] = useState(getAccessToken());
  const { authInfo } = useAuthInfo();
  const isLoggedIn = !!token;
  const profile = token ? getAuthUserProfile() : null;
  const isDark = theme === "dark";
  const profilePath = profile?.cckId ? `/profile/${encodeURIComponent(profile.cckId)}` : "/profile";
  const displayName = authInfo?.name?.trim() || profile?.name || "사용자";
  const englishName = authInfo?.enName?.trim() || profile?.englishName?.trim() || "";
  const menuDisplayName = englishName && englishName !== displayName ? `${displayName} (${englishName})` : displayName;
  const avatarInitial = displayName.trim().charAt(0) || "사";

  useEffect(() => {
    const syncAuthState = () => setToken(getAccessToken());
    window.addEventListener(authChangeEvent, syncAuthState);
    window.addEventListener("storage", syncAuthState);
    return () => {
      window.removeEventListener(authChangeEvent, syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/");
    }
  };

  if (isMobile) {
    return (
      <div className="header header--mobile">
        <button
          className="collapse-btn header-mobile-menu"
          onClick={onToggle}
          aria-pressed={mobileMenuOpen}
          aria-label={mobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
        >
          ☰
        </button>

        <div className="header-mobile-center">
          <img
            src={isDark ? "/logo/cck-ranking-white.png" : "/logo/cck-ranking-black.png"}
            alt="logo"
            className="logo header-mobile-logo"
            onClick={() => navigate("/")}
            draggable={false}
          />
        </div>

        <div className="header-right header-mobile-actions">
          {isLoggedIn ? (
            <UserMenu
              avatarInitial={avatarInitial}
              name={menuDisplayName}
              cckId={profile?.cckId ?? ""}
              onProfile={() => navigate(profilePath)}
              onSettings={() => navigate("/settings")}
              onLogout={handleLogout}
            />
          ) : (
            <button onClick={() => navigate("/login")} className="login-btn login-btn--compact">
              로그인
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="header">
      {/* 로고 & 사이드바 토글 */}
      <div className="header-left">
        <img
          src={isDark ? "/logo/cck-ranking-white.png" : "/logo/cck-ranking-black.png"}
          alt="logo"
          className="logo"
          onClick={() => navigate("/")}
          draggable={false}
        />
        <button
          className="collapse-btn"
          onClick={onToggle}
          aria-pressed={isMobile ? mobileMenuOpen : collapsed}
          aria-label={
            isMobile
              ? mobileMenuOpen
                ? "메뉴 닫기"
                : "메뉴 열기"
              : collapsed
                ? "사이드바 펼치기"
                : "사이드바 접기"
          }
        >
          ☰
        </button>
      </div>

      {/* 하이퍼링크 */}
      <div className="header-center">
        <a className="menu" href="https://cubingclub.com" target="_self">
          Main
        </a>

        <a className="menu active" target="_self">
          Ranking
        </a>

        <a className="menu" href="https://payment.cubingclub.com" target="_self">
          Payment
        </a>

        <a className="menu" href="https://groups.cubingclub.com" target="_self">
          Groups
        </a>

        <a className="menu" href="https://recorder.cubingclub.com" target="_self">
          Recorder
        </a>
      </div>

      {/* 로그인/회원 버튼 */}
      <div className="header-right">
        {isLoggedIn ? (
          <UserMenu
            avatarInitial={avatarInitial}
            name={menuDisplayName}
            cckId={profile?.cckId ?? ""}
            onProfile={() => navigate(profilePath)}
            onSettings={() => navigate("/settings")}
            onLogout={handleLogout}
          />
        ) : (
          <button onClick={() => navigate("/login")} className="login-btn">
            로그인
          </button>
        )}
      </div>
    </div>
  );
}

export default Header;
