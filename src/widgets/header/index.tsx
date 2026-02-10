import { useNavigate } from "react-router-dom";
import { logout } from "@/features/auth";
import { getAccessToken } from "@/features/auth/utils/tokenStorage";
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
  if (parts.length < 2) {
    return { name: "사용자", cckId: "" };
  }
  try {
    const payload = JSON.parse(decodeBase64Url(parts[1]));
    const name = payload?.name || payload?.nickname || payload?.preferred_username || "사용자";
    const cckId = payload?.cckId || payload?.memberId || payload?.id || payload?.sub || "";
    return { name, cckId: String(cckId) };
  } catch {
    return { name: "사용자", cckId: "" };
  }
};

function Header({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const navigate = useNavigate();
  const token = getAccessToken();
  const isLoggedIn = !!token;
  const profile = token ? getProfileFromToken(token) : null;

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate("/");
    }
  };

  return (
    <div className="header">
      {/* 로고 & 사이드바 토글 */}
      <div className="header-left">
        <img
          src="/logo/cck-ranking-black.png"
          alt="logo"
          className="logo"
          onClick={() => navigate("/")}
          draggable={false}
        />
        <button className="collapse-btn" onClick={onToggle} aria-pressed={collapsed} aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}>
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
            onSettings={() => navigate("/profile")}
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
