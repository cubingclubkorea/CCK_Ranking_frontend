import { Link } from "react-router-dom";

type CompetitionAdminHeaderProps = {
  totalCount: number;
};

export const CompetitionAdminHeader = ({ totalCount }: CompetitionAdminHeaderProps) => (
  <div className="admin-header">
    <div className="page-title-area round-title-area">
      <div className="page-title-icon" aria-hidden="true">
        <img src="/icon/sidebar/pencil.svg" alt="" loading="lazy" />
      </div>
      <div className="round-title-text">
        <h1 className="page-title">대회 관리</h1>
        <div className="page-title-meta">
          <span>Manage Competition</span>
          <span className="page-title-meta-divider">·</span>
          <span>총 {totalCount}건</span>
        </div>
      </div>
    </div>
    <div className="page-actions">
      <Link className="page-action-btn" to="/admin/competition/create">
        <img className="page-action-icon" src="/icon/button/plus.svg" alt="" aria-hidden="true" />
        대회 추가
      </Link>
    </div>
  </div>
);
