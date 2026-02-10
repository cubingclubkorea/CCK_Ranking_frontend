import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getCompetitionFuture, getCompetitionNow, getCompetitionPast } from "@/entities/competition";
import type { Competition } from "@/entities/competition";

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
        const errorMessage = err instanceof Error ? err.message : "알 수 없는 에러";
        setError(errorMessage);
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

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h1 className="admin-title">대회 관리</h1>
          <p className="admin-subtitle">등록된 대회 리스트를 한눈에 확인하세요.</p>
        </div>
        <div className="admin-actions">
          <Link className="admin-primary-btn" to="/admin/competition/create">
            + 대회 추가
          </Link>
          <div className="admin-count">총 {totalCount}건</div>
        </div>
      </div>

      {notice && <div className="dashboard-test-status dashboard-test-status--success">✅ {notice}</div>}
      {loading && <div className="dashboard-test-status">로딩 중...</div>}
      {error && <div className="dashboard-test-status dashboard-test-status--error">에러: {error}</div>}

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
              <tr key={`${row.status}-${row.competition.idx}`}>
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
