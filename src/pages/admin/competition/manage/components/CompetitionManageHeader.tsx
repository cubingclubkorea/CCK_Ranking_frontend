import { Link } from "react-router-dom";

type CompetitionManageHeaderProps = {
  title: string;
  subtitle?: string | null;
  iconSrc?: string;
  onViewCompetition?: () => void;
  onSave?: () => void;
  onDelete?: () => void;
  saving?: boolean;
};

export const CompetitionManageHeader = ({
  title,
  subtitle,
  iconSrc = "/icon/button/hammer.svg",
  onViewCompetition,
  onSave,
  onDelete,
  saving = false,
}: CompetitionManageHeaderProps) => {
  return (
    <div className="admin-header">
      <div className="page-title-area round-title-area">
        <div className="page-title-icon" aria-hidden="true">
          <img src={iconSrc} alt="" loading="lazy" />
        </div>
        <div className="round-title-text">
          <h1 className="page-title">{title}</h1>
          {subtitle ? (
            <div className="page-title-meta">
              <span>{subtitle}</span>
            </div>
          ) : null}
        </div>
      </div>
      <div className="page-actions">
        <Link className="page-action-btn" to="/admin/competition">
          <img className="page-action-icon" src="/icon/button/back.svg" alt="" aria-hidden="true" />
          목록으로
        </Link>
        {onSave ? (
          <button
            type="button"
            className="page-action-btn"
            onClick={onSave}
            disabled={saving}
          >
            <img className="page-action-icon" src="/icon/button/save.svg" alt="" aria-hidden="true" />
            저장
          </button>
        ) : null}
        {onDelete ? (
          <button type="button" className="page-action-btn" onClick={onDelete} disabled={saving}>
            <img className="page-action-icon" src="/icon/button/delete.svg" alt="" aria-hidden="true" />
            대회 삭제
          </button>
        ) : null}
        {onViewCompetition ? (
          <button type="button" className="page-action-btn" onClick={onViewCompetition}>
            <img className="page-action-icon" src="/icon/button/home.svg" alt="" aria-hidden="true" />
            대회 페이지 보기
          </button>
        ) : null}
      </div>
    </div>
  );
};
