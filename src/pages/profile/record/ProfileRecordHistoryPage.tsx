import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPlayerRecordHistory, type GlobalSingleRankingRecord } from "@/entities/statistics";
import type { Record as RoundRecord } from "@/entities/record";
import { formatTimeValue, toRecord } from "@/features/ranking";
import { RequestErrorPage } from "@/pages/error/RequestErrorPage";
import { RecordDetailModal } from "@/pages/round/components/RecordDetailModal";
import { resolveAverageValue, shouldUseRequestErrorPage } from "@/shared";
import { PageHeader } from "@/widgets";
import { RecordHistoryChart } from "./components/RecordHistoryChart";
import { RecordHistoryTable } from "./components/RecordHistoryTable";
import type { ThemeMode, TrendPoint } from "./types";

const normalizeEventName = (value?: string) => {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const normalizeRecordValue = (value: number | null | undefined, row: GlobalSingleRankingRecord) => {
  if (value === null || value === undefined || value < 0) return null;
  if (value === 0) {
    const hasPositiveAttempt = row.attempts.some((attempt) => typeof attempt.time === "number" && attempt.time > 0);
    if (!hasPositiveAttempt) return null;
  }
  return value;
};

const toSelectedRecord = (
  point: TrendPoint,
  rows: GlobalSingleRankingRecord[]
): { record: RoundRecord; rank: number } | null => {
  const targetRow = rows.find((row) => row.idx === point.recordId);
  if (!targetRow) return null;
  return { record: toRecord(targetRow), rank: point.idx };
};

export const ProfileRecordHistoryPage = () => {
  const navigate = useNavigate();
  const { cckId: rawCckId, event: rawEvent } = useParams();
  const cckId = (rawCckId ?? "").trim();
  const eventName = normalizeEventName(rawEvent);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyRows, setHistoryRows] = useState<GlobalSingleRankingRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<{ record: RoundRecord; rank: number } | null>(null);
  const [themeMode, setThemeMode] = useState<ThemeMode>(
    document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setThemeMode(document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchHistory = async () => {
      if (!cckId || !eventName) {
        setError("선수 또는 종목 정보가 없습니다.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const rows = await getPlayerRecordHistory(cckId, eventName);
        if (!mounted) return;
        setHistoryRows([...rows].sort((a, b) => a.idx - b.idx));
      } catch (fetchError) {
        if (!mounted) return;
        if (fetchError instanceof Error) {
          setError(fetchError.message);
        } else if (typeof fetchError === "string") {
          setError(fetchError);
        } else {
          setError("기록 추이 데이터를 불러오지 못했습니다.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchHistory();
    return () => {
      mounted = false;
    };
  }, [cckId, eventName]);

  const trendPoints = useMemo<TrendPoint[]>(() => {
    return historyRows.map((row, index) => {
      const resolvedAverage = resolveAverageValue(row.attempts, row.avgCalc, row.average);
      return {
        idx: index + 1,
        recordId: row.idx,
        label: `#${index + 1}`,
        compName: row.compName,
        roundName: row.roundName,
        roundIdx: row.roundIdx,
        compIdx: row.compIdx,
        single: normalizeRecordValue(row.single, row),
        average: normalizeRecordValue(resolvedAverage, row),
      };
    });
  }, [historyRows]);

  if (loading) {
    return (
      <div className="main-page profile-page">
        <PageHeader
          containerClassName="comp-header"
          iconSrc="/icon/sidebar/person.svg"
          title={`${eventName || "종목"} 기록 추이`}
          subtitle={cckId}
        />
        <section className="profile-section">
          <div className="profile-record-history-card">
            <div className="ui-skeleton ranking-skeleton-panel-title" aria-hidden="true" />
            <div className="ui-skeleton profile-record-history-skeleton-chart" aria-hidden="true" />
          </div>
        </section>
      </div>
    );
  }

  if (error && shouldUseRequestErrorPage(error)) {
    return <RequestErrorPage message={error} />;
  }

  if (error) {
    return <div className="round-page">{error}</div>;
  }

  return (
    <div className="main-page profile-page">
      <PageHeader
        containerClassName="comp-header"
        iconSrc="/icon/sidebar/person.svg"
        title={`${eventName} 기록 추이`}
        subtitle={cckId}
        actions={[
          {
            label: "선수 페이지",
            iconSrc: "/icon/button/back.svg",
            onClick: () => navigate(`/profile/${encodeURIComponent(cckId)}`),
          },
          {
            label: "랭킹 홈",
            iconSrc: "/icon/button/home.svg",
            to: "/",
          },
        ]}
      />

      <section className="profile-section">
        <div className="profile-record-history-card">
          <div className="profile-record-history-head">
            <h3 className="profile-main-section-title">대회별 추이</h3>
            <span className="profile-record-history-meta">총 {trendPoints.length}개 기록</span>
          </div>
          {trendPoints.length > 0 ? (
            <RecordHistoryChart
              points={trendPoints}
              themeMode={themeMode}
              onSelectPoint={(point) => {
                const selected = toSelectedRecord(point, historyRows);
                if (!selected) return;
                setSelectedRecord(selected);
              }}
            />
          ) : (
            <div className="round-list-empty">표시할 기록이 없습니다.</div>
          )}
        </div>

        {trendPoints.length > 0 ? (
          <RecordHistoryTable
            points={trendPoints}
            onSelectPoint={(point) => {
              const selected = toSelectedRecord(point, historyRows);
              if (!selected) return;
              setSelectedRecord(selected);
            }}
          />
        ) : null}
      </section>

      <RecordDetailModal
        selected={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        formatTimeValue={formatTimeValue}
      />
    </div>
  );
};
