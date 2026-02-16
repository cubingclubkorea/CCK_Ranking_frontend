type OrganizerInfoModalProps = {
  open: boolean;
  onClose: () => void;
};

export const OrganizerInfoModal = ({ open, onClose }: OrganizerInfoModalProps) => {
  if (!open) return null;

  return (
    <div className="profile-role-modal-backdrop" onClick={onClose}>
      <div
        className="profile-role-modal"
        role="dialog"
        aria-modal="true"
        aria-label="ORGANIZER 안내"
        onClick={(event) => event.stopPropagation()}
      >
        <h4>ORGANIZER 안내</h4>
        <p>이 사용자는 대회 생성, 수정, 운영 관련 권한을 가진 관리자입니다.</p>
        <button type="button" className="profile-role-modal-close" onClick={onClose}>
          확인
        </button>
      </div>
    </div>
  );
};

