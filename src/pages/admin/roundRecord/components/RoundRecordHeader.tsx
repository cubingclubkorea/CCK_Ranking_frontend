import { useNavigate } from "react-router-dom";

type RoundRecordHeaderProps = {
  title: string;
  eventName?: string;
  subtitle?: string;
  compIdx: number;
  roundIdx: number;
};

export const RoundRecordHeader = ({
  title,
  eventName,
  subtitle,
  compIdx,
  roundIdx,
}: RoundRecordHeaderProps) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="page-title-area round-title-area">
        <div className="page-title-icon" aria-hidden="true">
          <img src="/icon/button/hammer.svg" alt="" loading="lazy" />
        </div>
        <div className="round-title-text">
          <h1 className="page-title">
            {eventName ? `${eventName} ` : ""}
            {title}
          </h1>
          {subtitle ? (
            <div className="page-title-meta">
              <span>라운드 관리 모드 · {subtitle}</span>
            </div>
          ) : null}
        </div>
      </div>
      <div className="page-actions">
        <button
          className="page-action-btn"
          type="button"
          onClick={() => navigate(`/competition/${compIdx}/round/${roundIdx}`)}
        >
          <img className="page-action-icon" src="/icon/button/back.svg" alt="" aria-hidden="true" />
          라운드로 돌아가기
        </button>
        <button className="page-action-btn" type="button" onClick={() => navigate("/")}>
          <img className="page-action-icon" src="/icon/button/home.svg" alt="" aria-hidden="true" />
          랭킹 홈
        </button>
      </div>
    </>
  );
};
