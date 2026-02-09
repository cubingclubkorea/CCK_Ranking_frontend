import { Link } from "react-router-dom";

export const DashboardPage = () => {
  const menuItems = [
    { path: "/dashboard/competition", label: "대회 조회", icon: "🏆" },
    { path: "/dashboard/competition/cud", label: "대회 관리 (CUD)", icon: "⚙️" },
    { path: "/dashboard/event", label: "큐브 이벤트", icon: "🎲" },
    { path: "/dashboard/round", label: "라운드 조회", icon: "🔄" },
    { path: "/dashboard/round/cud", label: "라운드 관리 (CUD)", icon: "⚙️" },
    { path: "/dashboard/record", label: "기록 조회", icon: "📊" },
    { path: "/dashboard/record/cud", label: "기록 관리 (CUD)", icon: "⚙️" },
    { path: "/dashboard/scramble", label: "스크램블", icon: "🔀" },
  ];

  return (
    <div
      style={{
        padding: "40px",
        fontFamily: "sans-serif",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "40px", fontSize: "2.5rem" }}>CCK Ranking Dashboard</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "20px",
        }}
      >
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            style={{
              textDecoration: "none",
              padding: "30px",
              backgroundColor: "#f8f9fa",
              border: "2px solid #dee2e6",
              borderRadius: "10px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#e9ecef";
              e.currentTarget.style.borderColor = "#0d6efd";
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.borderColor = "#0d6efd";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#f8f9fa";
              e.currentTarget.style.borderColor = "#dee2e6";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.borderColor = "#dee2e6";
            }}
          >
            <div style={{ fontSize: "3rem" }}>{item.icon}</div>
            <div
              style={{
                fontSize: "1.2rem",
                fontWeight: "bold",
                color: "#212529",
                textAlign: "center",
              }}
            >
              {item.label}
            </div>
          </Link>
        ))}
      </div>

      <div
        style={{
          marginTop: "60px",
          textAlign: "center",
          padding: "20px",
          backgroundColor: "#f8f9fa",
          borderRadius: "10px",
          border: "1px solid #dee2e6",
        }}
      >
        <h3 style={{ marginBottom: "10px" }}>인증 테스트</h3>
        <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
          <Link
            to="/login"
            style={{
              padding: "10px 20px",
              backgroundColor: "#0d6efd",
              color: "white",
              textDecoration: "none",
              borderRadius: "5px",
            }}
          >
            로그인
          </Link>
          <Link
            to="/logout"
            style={{
              padding: "10px 20px",
              backgroundColor: "#dc3545",
              color: "white",
              textDecoration: "none",
              borderRadius: "5px",
            }}
          >
            로그아웃
          </Link>
        </div>
      </div>
    </div>
  );
};
