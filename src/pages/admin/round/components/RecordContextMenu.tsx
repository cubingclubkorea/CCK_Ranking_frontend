type RecordContextMenuProps = {
  open: boolean;
  position: { x: number; y: number } | null;
  onEditInfo: () => void;
  onEdit: () => void;
  onExtra: () => void;
  onClose: () => void;
};

export const RecordContextMenu = ({
  open,
  position,
  onEditInfo,
  onEdit,
  onExtra,
  onClose,
}: RecordContextMenuProps) => {
  if (!open || !position) return null;

  return (
    <div className="record-context-backdrop" onClick={onClose}>
      <div
        className="record-context-menu"
        style={{ top: position.y, left: position.x }}
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="record-context-item" onClick={onEditInfo}>
          선수 편집
        </button>
        <button type="button" className="record-context-item" onClick={onEdit}>
          기록 편집
        </button>
        <button type="button" className="record-context-item" onClick={onExtra}>
          엑스트라
        </button>
      </div>
    </div>
  );
};
