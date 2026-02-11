import { Link } from "react-router-dom";

export const CompetitionCreateHeader = () => (
  <div className="admin-header">
    <div className="page-title-area">
      <div className="page-title-main">
        <div className="page-title-icon" aria-hidden="true">
          <img src="/icon/sidebar/pencil.svg" alt="" loading="lazy" />
        </div>
        <h1 className="page-title">대회 만들기</h1>
      </div>
      <div className="page-title-meta">
        <span>기본 정보와 종목별 참가비를 등록하세요.</span>
      </div>
    </div>
    <div className="page-actions">
      <Link className="page-action-btn" to="/admin/competition">
        <img className="page-action-icon" src="/icon/button/back.svg" alt="" aria-hidden="true" />
        목록으로
      </Link>
    </div>
  </div>
);
