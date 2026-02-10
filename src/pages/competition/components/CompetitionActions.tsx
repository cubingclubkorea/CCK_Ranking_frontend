import { useNavigate } from "react-router-dom";

type CompetitionActionsProps = {
  compIdx: number;
};

export const CompetitionActions = ({ compIdx }: CompetitionActionsProps) => {
  const navigate = useNavigate();
  return (
    <div className="comp-actions">
      <button className="comp-action-btn" type="button" onClick={() => navigate(`/admin/competition/${compIdx}`)}>
        <img className="comp-action-icon" src="/icon/button/hammer.svg" alt="" aria-hidden="true" />
        대회 관리
      </button>
      <button className="comp-action-btn" type="button" onClick={()=> navigate('/')}>
        <img className="comp-action-icon" src="/icon/button/home.svg" alt="" aria-hidden="true" />
        랭킹 홈
      </button>
      <button className="comp-action-btn" type="button" onClick={()=> window.location.href = "https://cubingclub.com/pages/competition"}>
        <img className="comp-action-icon comp-action-icon--logo" src="/logo/cck-logo.png" alt="" aria-hidden="true" />
        대회 정보
      </button>
    </div>
  );
};
