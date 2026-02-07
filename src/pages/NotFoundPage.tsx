import { useNavigate } from "react-router-dom";

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="not-found">
      <div className="not-found-code">404</div>
      <div className="not-found-title">페이지를 찾을 수 없습니다</div>
      <div className="not-found-desc">요청하신 페이지가 존재하지 않거나 이동되었습니다.</div>
      <button className="not-found-btn" onClick={() => navigate("/")}>
        홈으로 돌아가기
      </button>
    </div>
  );
};
