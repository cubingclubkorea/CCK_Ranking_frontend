import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Sidebar({ collapsed }: { collapsed: boolean }) {
  const navigate = useNavigate();
  const [adminOpen, setAdminOpen] = useState(true);

  return (
    <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      {/* 일반 메뉴 */}
      <div className="menu-group">
        <MenuItem text="대회 목록" icon="📋" onClick={() => navigate("/contest")} />
        <MenuItem text="신기록" icon="⚙️" />
        <MenuItem text="랭킹" icon="🏆" />
        <MenuItem text="나의 정보" icon="👤" />
        <MenuItem text="기록 이전 신청" icon="📄" />
      </div>

      {/* 관리자 메뉴 */}
      <div className="admin-group">
        {!collapsed && (
          <div className="admin-title" onClick={() => setAdminOpen(!adminOpen)}>
            관리자 메뉴 <span>{adminOpen ? "⌃" : "⌄"}</span>
          </div>
        )}

        {adminOpen && (
          <>
            <MenuItem text="회원 관리" icon="👥" />
            <MenuItem text="대회 관리" icon="✏️" />
            <MenuItem text="큐브 종목 관리" icon="📦" />
            <MenuItem text="선수카드 등록" icon="💳" />
            <MenuItem text="OAuth 관리" icon="🔒" />
          </>
        )}
      </div>
    </aside>
  );
}

function MenuItem({
  icon,
  text,
  onClick,
}: {
  icon: string;
  text: string;
  onClick?: () => void;
}) {
  return (
    <div className="menu-item" onClick={onClick}>
      <span className="icon">{icon}</span>
      <span className="text">{text}</span>
    </div>
  );
}

export default Sidebar;