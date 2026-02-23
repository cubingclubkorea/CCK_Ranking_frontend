import { useEffect, useRef, useState } from "react";
import type { Record } from "@/entities/record";
import { RecordTable } from "@/pages/round/components/RecordTable";

type RecordTablePanelProps = {
  records: Record[];
  emptyMessage: string;
  advanceCount?: number;
  selectedRecordIdx?: number;
  formatTimeValue: (value?: number | null) => string;
  getAttemptValue: (attempts: Record["attempts"], attemptTry: number) => string;
  onSelect: (record: Record) => void;
  onContextMenu?: (record: Record, rank: number, position: { x: number; y: number }) => void;
};

export const RecordTablePanel = ({
  records,
  emptyMessage,
  advanceCount,
  selectedRecordIdx,
  formatTimeValue,
  getAttemptValue,
  onSelect,
  onContextMenu,
}: RecordTablePanelProps) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [isNarrowPanel, setIsNarrowPanel] = useState(false);

  useEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const syncNarrowState = () => {
      setIsNarrowPanel(panel.clientWidth <= 760);
    };

    syncNarrowState();

    const observer = new ResizeObserver(() => {
      syncNarrowState();
    });
    observer.observe(panel);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={panelRef} className="record-table-panel">
      <RecordTable
        records={records}
        emptyMessage={emptyMessage}
        advanceCount={advanceCount}
        compactAttempts={isNarrowPanel}
        formatTimeValue={formatTimeValue}
        getAttemptValue={getAttemptValue}
        onSelect={(record) => onSelect(record)}
        onContextMenu={onContextMenu}
        selectedRecordIdx={selectedRecordIdx}
      />
    </div>
  );
};
