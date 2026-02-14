import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout } from "@/features/auth";
import { authChangeEvent, getAccessToken } from "@/features/auth/utils/tokenStorage";
import { UserMenu } from "./UserMenu";

const decodeBase64Url = (input: string): string => {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  const binary = atob(base64);
  const percentEncoded = Array.from(binary)
    .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
    .join("");
  try {
    return decodeURIComponent(percentEncoded);
  } catch {
    return binary;
  }
};

const getProfileFromToken = (token: string): { name: string; cckId: string } => {
  const parts = token.split(".");
  const payloadPart = parts.length >= 2 ? parts[1] : token;

  try {
    const payload = JSON.parse(decodeBase64Url(payloadPart));
    const name = payload?.name || payload?.nickname || payload?.preferred_username || "사용자";
    const cckId = payload?.cckId || payload?.memberId || payload?.id || payload?.sub || "";
    return { name, cckId: String(cckId) };
  } catch {
    return { name: "사용자", cckId: "" };
  }
};

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
  const isLoggedIn = !!token;
  const profile = token ? getProfileFromToken(token) : null;
  const isDark = theme === "dark";

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
              avatarSrc="/icon/sidebar/person.svg"
              name={profile?.name ?? "사용자"}
              cckId={profile?.cckId ?? ""}
              onProfile={() => navigate("/profile")}
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

        <a className="menu" href="https://recorder.cubingclub.com" target="_self">
          Recorder
        </a>
      </div>

      {/* 로그인/회원 버튼 */}
      <div className="header-right">
        {isLoggedIn ? (
          <UserMenu
            avatarSrc="/icon/sidebar/person.svg"
            name={profile?.name ?? "사용자"}
            cckId={profile?.cckId ?? ""}
            onProfile={() => navigate("/profile")}
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
