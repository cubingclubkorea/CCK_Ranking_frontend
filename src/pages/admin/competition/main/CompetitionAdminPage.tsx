import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCompetitionFuture, getCompetitionNow, getCompetitionPast } from "@/entities/competition";
import type { Competition } from "@/entities/competition";
import { OverlayToast } from "@/widgets";
import { CompetitionAdminHeader } from "./components/CompetitionAdminHeader";

type CompetitionRow = {
  status: "ongoing" | "upcoming" | "ended";
  competition: Competition;
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatRange = (start: Date, end: Date) => {
  if (formatDate(start) === formatDate(end)) {
    return formatDate(start);
  }
  return `${formatDate(start)} ~ ${formatDate(end)}`;
};

export const CompetitionAdminPage = () => {
  const [rows, setRows] = useState<CompetitionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const getErrorMessage = (err: unknown) => {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    try {
      return JSON.stringify(err);
    } catch {
      return "알 수 없는 오류가 발생했습니다.";
    }
  };

  useEffect(() => {
    const state = location.state as { notice?: string } | null;
    if (state?.notice) {
      setNotice(state.notice);
      navigate("/admin/competition", { replace: true, state: null });
    }
  }, [location.state, navigate]);

  useEffect(() => {
    let mounted = true;

    const fetchRows = async () => {
      setLoading(true);
      setError(null);
      try {
        const [future, now, past] = await Promise.all([
          getCompetitionFuture({ page: 0, size: 200 }),
          getCompetitionNow({ page: 0, size: 200 }),
          getCompetitionPast({ page: 0, size: 200 }),
        ]);

        if (!mounted) return;

        const toRows = (status: CompetitionRow["status"], list: Competition[]) =>
          list.map<CompetitionRow>((competition) => ({ status, competition }));

        const nextRows: CompetitionRow[] = [
          ...toRows("ongoing", now.content),
          ...toRows("upcoming", future.content),
          ...toRows("ended", past.content),
        ];

        nextRows.sort(
          (a, b) => b.competition.compDateStart.getTime() - a.competition.compDateStart.getTime()
        );

        setRows(nextRows);
      } catch (err) {
        if (!mounted) return;
        setError(getErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchRows();

    return () => {
      mounted = false;
    };
  }, []);

  const totalCount = useMemo(() => rows.length, [rows.length]);
  const toast = error
    ? { variant: "error" as const, message: error, onClose: () => setError(null) }
    : notice
      ? { variant: "success" as const, message: notice, onClose: () => setNotice(null) }
      : loading
        ? { variant: "info" as const, message: "로딩 중...", onClose: undefined }
        : null;

  return (
    <div className="admin-page">
      <OverlayToast
        open={!!toast}
        variant={toast?.variant}
        message={toast?.message ?? ""}
        onClose={toast?.onClose}
      />

      <CompetitionAdminHeader totalCount={totalCount} />

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>대회명</th>
              <th>기간</th>
              <th>정원</th>
              <th>장소</th>
              <th>기본 참가비</th>
              <th>상태</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={`${row.status}-${row.competition.idx}`}
                className="admin-table-row--clickable"
                onClick={() => navigate(`/admin/competition/${row.competition.idx}`)}
              >
                <td className="admin-id">#{row.competition.idx}</td>
                <td className="admin-name">{row.competition.compName}</td>
                <td>{formatRange(row.competition.compDateStart, row.competition.compDateEnd)}</td>
                <td>{(row.competition.maxParticipate ?? 0).toLocaleString()}</td>
                <td>{row.competition.location || "-"}</td>
                <td>{(row.competition.baseFee ?? 0).toLocaleString()}원</td>
                <td>
                  <span className={`admin-status admin-status--${row.status}`}>
                    {row.status === "ongoing"
                      ? "진행중"
                      : row.status === "upcoming"
                      ? "예정"
                      : "종료"}
                  </span>
                </td>
              </tr>
            ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td className="admin-empty" colSpan={7}>
                  표시할 대회가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
