import { Link } from "react-router-dom";

export const ApiDashboardPage = () => {
  const menuItems = [
    { path: "/admin/api-dashboard/competition", label: "대회 조회", icon: "🏆" },
    { path: "/admin/api-dashboard/competition/cud", label: "대회 관리 (CUD)", icon: "⚙️" },
    { path: "/admin/api-dashboard/event", label: "큐브 이벤트", icon: "🎲" },
    { path: "/admin/api-dashboard/round", label: "라운드 조회", icon: "🔄" },
    { path: "/admin/api-dashboard/round/cud", label: "라운드 관리 (CUD)", icon: "⚙️" },
    { path: "/admin/api-dashboard/new-record", label: "기록 조회", icon: "📊" },
    { path: "/admin/api-dashboard/new-record/cud", label: "기록 관리 (CUD)", icon: "⚙️" },
    { path: "/admin/api-dashboard/scramble", label: "스크램블", icon: "🔀" },
  ];

  return (
    <div className="dashboard-page">
      <h1 className="dashboard-title">CCK Ranking API Dashboard</h1>

      <div className="dashboard-grid">
        {menuItems.map((item) => (
          <Link key={item.path} to={item.path} className="dashboard-card">
            <div className="dashboard-card-icon">{item.icon}</div>
            <div className="dashboard-card-label">{item.label}</div>
          </Link>
        ))}
      </div>

      <div className="dashboard-auth">
        <h3 className="dashboard-auth-title">인증 테스트</h3>
        <div className="dashboard-auth-actions">
          <Link to="/login" className="dashboard-auth-btn dashboard-auth-btn--login">
            로그인
          </Link>
          <Link to="/logout" className="dashboard-auth-btn dashboard-auth-btn--logout">
            로그아웃
          </Link>
        </div>
      </div>
    </div>
  );
};
