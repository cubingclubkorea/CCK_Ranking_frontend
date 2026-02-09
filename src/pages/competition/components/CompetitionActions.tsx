export const CompetitionActions = () => {
  return (
    <div className="comp-actions">
      <button className="comp-action-btn" type="button">
        <span className="comp-action-icon comp-action-icon--active" aria-hidden="true" />
        참가중
      </button>
      <button className="comp-action-btn comp-action-btn--ghost" type="button">
        <span className="comp-action-icon comp-action-icon--danger" aria-hidden="true" />
        신청 취소
      </button>
    </div>
  );
};
