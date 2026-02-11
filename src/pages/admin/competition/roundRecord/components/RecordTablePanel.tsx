import type { Record } from "@/entities/record";
import { RecordTable } from "@/pages/round/components/RecordTable";

type RecordTablePanelProps = {
  records: Record[];
  emptyMessage: string;
  advanceCount?: number;
  selectedRecordIdx?: number;
  formatTimeValue: (value?: number) => string;
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
  return (
    <div className="record-table-panel">
      <RecordTable
        records={records}
        emptyMessage={emptyMessage}
        advanceCount={advanceCount}
        formatTimeValue={formatTimeValue}
        getAttemptValue={getAttemptValue}
        onSelect={(record) => onSelect(record)}
        onContextMenu={onContextMenu}
        selectedRecordIdx={selectedRecordIdx}
      />
    </div>
  );
};
