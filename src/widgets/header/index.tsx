import { useNavigate } from "react-router-dom";

function Header({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const navigate = useNavigate();

  return (
    <div className="header">
      {/* 로고 & 사이드바 토글 */}
      <div className="header-left">
        <img src="logo/cck-ranking-black.png" className="logo" onClick={() => navigate("")} />
        <button className="collapse-btn header-collapse-btn" onClick={onToggle} aria-pressed={collapsed} aria-label={collapsed ? "사이드바 펼치기" : "사이드바 접기"}>
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
        <a className="menu" href="dashboard" target="_self">
          Dashboard (API Test)
        </a>
      </div>

      {/* 로그인/회원 버튼 */}
      <div className="header-right">
        <button onClick={() => navigate("/login")} className="login-btn">
          로그인
        </button>
      </div>
    </div>
  );
}

export default Header;
