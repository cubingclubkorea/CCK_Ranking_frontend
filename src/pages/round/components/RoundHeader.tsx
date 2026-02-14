import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authChangeEvent, hasAdminRole } from "@/features/auth/utils/tokenStorage";

type RoundHeaderProps = {
  title: string;
  eventName?: string;
  subtitle?: string;
  eventStart?: Date;
  eventEnd?: Date;
  compIdx?: number;
  roundIdx?: number;
  adminActionLabel?: string;
  adminActionPath?: string;
  adminActionIcon?: string;
  showAdminAction?: boolean;
};

const isValidDate = (value?: Date): value is Date => value instanceof Date && !Number.isNaN(value.getTime());

const formatTimePart = (date: Date) => {
  const hour = `${date.getHours()}`.padStart(2, "0");
  const minute = `${date.getMinutes()}`.padStart(2, "0");
  return `${hour}:${minute}`;
};

const formatRoundDateTime = (eventStart?: Date, eventEnd?: Date) => {
  if (!isValidDate(eventStart)) {
    return null;
  }
  const start = eventStart;
  if (!isValidDate(eventEnd)) {
    return formatTimePart(start);
  }
  const end = eventEnd;
  return `${formatTimePart(start)}~${formatTimePart(end)}`;
};

export const RoundHeader = ({
  title,
  eventName,
  subtitle,
  eventStart,
  eventEnd,
  compIdx,
  roundIdx,
  adminActionLabel = "라운드 관리",
  adminActionPath,
  adminActionIcon = "/icon/button/hammer.svg",
  showAdminAction = true,
}: RoundHeaderProps) => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(hasAdminRole());
  const defaultAdminPath = compIdx && roundIdx ? `/admin/competition/${compIdx}/round/${roundIdx}` : null;
  const roundManagePath = adminActionPath ?? defaultAdminPath;
  const roundDateTime = formatRoundDateTime(eventStart, eventEnd);

  useEffect(() => {
    const syncAuthState = () => setIsAdmin(hasAdminRole());
    window.addEventListener(authChangeEvent, syncAuthState);
    window.addEventListener("storage", syncAuthState);
    return () => {
      window.removeEventListener(authChangeEvent, syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

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
          <h1 className="page-title round-title-heading">
            {eventName ? (
              <>
                <span className="round-title-event">{eventName}</span>
                <span className="round-title-round">{title}</span>
              </>
            ) : (
              <span className="round-title-round">{title}</span>
            )}
          </h1>
          {subtitle ? (
            <div className="page-title-meta">
              <span>{subtitle}</span>
              {roundDateTime ? (
                <>
                  <span className="page-title-meta-divider">·</span>
                  <span>{roundDateTime}</span>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
      {compIdx ? (
        <div className="page-actions">
          {showAdminAction && isAdmin && (
            <button
              className="page-action-btn"
              type="button"
              onClick={() => {
                if (roundManagePath) {
                  navigate(roundManagePath);
                }
              }}
              disabled={!roundManagePath}
            >
              <img className="page-action-icon" src={adminActionIcon} alt="" aria-hidden="true" />
              {adminActionLabel}
            </button>
          )}
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
