import { useNavigate } from "react-router-dom";

type RoundHeaderProps = {
  title: string;
  eventName?: string;
  subtitle?: string;
  compIdx?: number;
};

export const RoundHeader = ({ title, eventName, subtitle, compIdx }: RoundHeaderProps) => {
  const navigate = useNavigate();

  return (
    <>
      <div className="page-title-area round-title-area">
        <div className="page-title-icon" aria-hidden="true">
          <img
            src={`/icon/events/${encodeURIComponent(eventName || "Question")}.svg`}
            alt=""
            loading="lazy"
            onError={(event) => {
              const target = event.currentTarget;
              if (target.dataset.fallback === "true") {
                target.style.display = "none";
                return;
              }
              target.dataset.fallback = "true";
              target.src = "/icon/events/Question.svg";
            }}
          />
        </div>
        <div className="round-title-text">
          <h1 className="page-title">
            {eventName ? `${eventName} ` : ""}
            {title}
          </h1>
          {subtitle ? (
            <div className="page-title-meta">
              <span className="page-title-meta-item">{subtitle}</span>
            </div>
          ) : null}
        </div>
      </div>
      {compIdx ? (
        <div className="page-actions">
          <button className="page-action-btn" type="button" onClick={() => navigate(`/admin/competition/${compIdx}`)}>
            <img className="page-action-icon" src="/icon/button/hammer.svg" alt="" aria-hidden="true" />
            대회 관리
          </button>
          <button className="page-action-btn" type="button" onClick={() => navigate(`/competition/${compIdx}`)}>
            <img className="page-action-icon" src="/icon/button/back.svg" alt="" aria-hidden="true" />
            라운드 목록
          </button>
          <button className="page-action-btn" type="button" onClick={() => navigate("/")}>
            <img className="page-action-icon" src="/icon/button/home.svg" alt="" aria-hidden="true" />
            랭킹 홈
          </button>
        </div>
      ) : null}
    </>
  );
};
