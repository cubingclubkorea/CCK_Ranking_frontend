import { useNavigate } from "react-router-dom";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="error">
      <div className="error-code">404</div>
      <div className="error-title">페이지를 찾을 수 없습니다</div>
      <div className="error-desc">요청하신 페이지가 존재하지 않거나 이동되었습니다.</div>
      <button className="error-btn" onClick={() => navigate("/")}>
        <img className="error-btn-icon" src="/icon/button/home.svg" alt="" aria-hidden="true" />
        홈으로 돌아가기
      </button>
    </div>
  );
};
