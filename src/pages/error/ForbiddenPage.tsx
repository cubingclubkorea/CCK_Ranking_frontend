import { useNavigate } from "react-router-dom";

export const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <div className="error">
      <div className="error-code">403</div>
      <div className="error-title">접근이 제한되었습니다</div>
      <div className="error-desc">이 페이지에 접근할 권한이 없습니다</div>
      <button className="error-btn" onClick={() => navigate("/")}>
        <img className="error-btn-icon" src="/icon/button/home.svg" alt="" aria-hidden="true" />
        홈으로 돌아가기
      </button>
    </div>
  );
}
