import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authChangeEvent, hasAdminRole } from "@/features/auth/utils/tokenStorage";

type CompetitionHeaderProps = {
  title: string;
  dateStart: Date;
  location?: string;
  compIdx?: number;
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const CompetitionHeader = ({ title, dateStart, location, compIdx }: CompetitionHeaderProps) => {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(hasAdminRole());

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
      <div className="page-title-area">
        <h1 className="page-title">{title}</h1>
        <div className="page-title-meta">
          <span>{formatDate(dateStart)}</span>
          {location ? (
            <>
              <span className="page-title-meta-divider">·</span>
              <span>{location}</span>
            </>
          ) : null}
        </div>
      </div>
      {compIdx ? (
        <div className="page-actions">
          {isAdmin && (
            <>
              <button className="page-action-btn" type="button" onClick={() => navigate(`/admin/competition/${compIdx}/scramble`)}>
                <img className="page-action-icon" src="/icon/button/cube.svg" alt="" aria-hidden="true" />
                스크램블
              </button>
              <button className="page-action-btn" type="button" onClick={() => navigate(`/admin/competition/${compIdx}`)}>
                <img className="page-action-icon" src="/icon/button/hammer.svg" alt="" aria-hidden="true" />
                대회 관리
              </button>
            </>
          )}
          <button
            className="page-action-btn"
            type="button"
            onClick={() => {
              window.location.href = "https://cubingclub.com/pages/competition";
            }}
          >
            <img className="page-action-icon page-action-icon--logo" src="/logo/cck-logo.png" alt="" aria-hidden="true" />
            대회 정보
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
