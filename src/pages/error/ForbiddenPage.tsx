import { useNavigate } from "react-router-dom";

export const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <div className="error">
      <div className="error-code">403</div>
      <div className="error-title">접근이 제한되었습니다</div>
      <div className="error-desc">이 리소스에 접근할 권한이 없습니다</div>
      <button className="error-btn" onClick={() => navigate("/")}>
        홈으로 돌아가기
      </button>
    </div>
  );
}