import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getRound } from "@/entities/round";
import { getRecordList } from "@/entities/record";
import type { Round } from "@/entities/round";
import type { Record } from "@/entities/record";
import { getErrorMessage, getEventIconSrc, resolveAverageValue, shouldUseRequestErrorPage } from "@/shared";
import { authChangeEvent, hasAdminRole } from "@/features/auth/utils/tokenStorage";
import { PageHeader, RoundPageSkeleton } from "@/widgets";
import { RequestErrorPage } from "@/pages/error/RequestErrorPage";
import { RecordTable } from "./components/RecordTable";
import { RecordDetailModal } from "./components/RecordDetailModal";

const COMPACT_RECORD_QUERY = "(max-width: 980px), (max-aspect-ratio: 5/4)";
const isValidDate = (value?: Date): value is Date => value instanceof Date && !Number.isNaN(value.getTime());

const formatTimePart = (date: Date) => {
  const hour = `${date.getHours()}`.padStart(2, "0");
  const minute = `${date.getMinutes()}`.padStart(2, "0");
  return `${hour}:${minute}`;
};

const formatRoundDateTime = (eventStart?: Date, eventEnd?: Date) => {
  if (!isValidDate(eventStart)) {
    return null;
  }
  if (!isValidDate(eventEnd)) {
    return formatTimePart(eventStart);
  }
  return `${formatTimePart(eventStart)}~${formatTimePart(eventEnd)}`;
};

const formatTimeValue = (value?: number | null) => {
  if (value === null || value === undefined) {
    return "-";
  }
  if (value === -1) {
    return "DNF";
  }
  if (value === -2) {
    return "DNS";
  }
  const absValue = Math.abs(value);
  if (absValue >= 60) {
    const minutes = Math.floor(absValue / 60);
    const seconds = absValue - minutes * 60;
    return `${minutes}:${seconds.toFixed(2).padStart(5, "0")}`;
  }
  return value.toFixed(2);
};

export const RoundPage = () => {
  const navigate = useNavigate();
  const { compIdx, roundIdx } = useParams();
  const [round, setRound] = useState<Round | null>(null);
  const [records, setRecords] = useState<Record[]>([]);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchActiveIndex, setSearchActiveIndex] = useState(-1);
  const [isSearchComposing, setIsSearchComposing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<{ record: Record; rank: number } | null>(null);
  const [compactRecordView, setCompactRecordView] = useState(() => window.matchMedia(COMPACT_RECORD_QUERY).matches);
  const [isAdmin, setIsAdmin] = useState(hasAdminRole());
  const suggestionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      if (!roundIdx) {
        if (mounted) {
          setError("라운드 정보가 없습니다.");
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [roundData, recordData] = await Promise.all([
          getRound(Number(roundIdx)),
          getRecordList(Number(roundIdx)),
        ]);
        if (!mounted) return;
        setRound(roundData);
        setRecords(recordData);
      } catch (fetchError) {
        console.error("라운드 랭킹 조회 실패:", fetchError);
        if (mounted) setError(getErrorMessage(fetchError, "랭킹 정보를 불러올 수 없습니다."));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [roundIdx]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(COMPACT_RECORD_QUERY);
    const syncCompactMode = (event: MediaQueryListEvent) => setCompactRecordView(event.matches);
    setCompactRecordView(mediaQuery.matches);
    mediaQuery.addEventListener("change", syncCompactMode);
    return () => mediaQuery.removeEventListener("change", syncCompactMode);
  }, []);

  useEffect(() => {
    const syncAuthState = () => setIsAdmin(hasAdminRole());
    window.addEventListener(authChangeEvent, syncAuthState);
    window.addEventListener("storage", syncAuthState);
    return () => {
      window.removeEventListener(authChangeEvent, syncAuthState);
      window.removeEventListener("storage", syncAuthState);
    };
  }, []);

  const sortedRecords = useMemo(() => {
    return [...records].sort((a, b) => {
      const rankA = a.ranking ?? Number.MAX_SAFE_INTEGER;
      const rankB = b.ranking ?? Number.MAX_SAFE_INTEGER;
      if (rankA !== rankB) return rankA - rankB;
      const avgA = resolveAverageValue(a.attempts, a.avgCalc, a.average) ?? Number.MAX_SAFE_INTEGER;
      const avgB = resolveAverageValue(b.attempts, b.avgCalc, b.average) ?? Number.MAX_SAFE_INTEGER;
      if (avgA !== avgB) return avgA - avgB;
      const singleA = a.single ?? Number.MAX_SAFE_INTEGER;
      const singleB = b.single ?? Number.MAX_SAFE_INTEGER;
      return singleA - singleB;
    });
  }, [records]);

  const filteredRecords = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return sortedRecords;
    return sortedRecords.filter((record) => {
      return (
        record.name.toLowerCase().includes(keyword) ||
        record.cckId.toLowerCase().includes(keyword)
      );
    });
  }, [search, sortedRecords]);

  const searchResults = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return [];
    return sortedRecords.filter((record) => {
      return (
        record.name.toLowerCase().includes(keyword) ||
        record.cckId.toLowerCase().includes(keyword)
      );
    }).slice(0, 8);
  }, [search, sortedRecords]);

  useEffect(() => {
    if (searchResults.length === 0) {
      setSearchActiveIndex(-1);
      return;
    }
    setSearchActiveIndex((prev) => {
      if (prev < 0) return 0;
      return Math.min(prev, searchResults.length - 1);
    });
  }, [searchResults]);

  useEffect(() => {
    if (!searchOpen || searchActiveIndex < 0) return;
    suggestionRefs.current[searchActiveIndex]?.scrollIntoView({ block: "nearest" });
  }, [searchActiveIndex, searchOpen]);

  const getNextSearchIndex = (prev: number, direction: 1 | -1) => {
    if (searchResults.length === 0) return -1;
    if (prev < 0) {
      return direction > 0 ? 0 : searchResults.length - 1;
    }
    return (prev + direction + searchResults.length) % searchResults.length;
  };

  const applySearchSelection = (record: Record) => {
    setSearch(record.name);
    setSearchOpen(false);
  };

  if (loading) {
    return <RoundPageSkeleton />;
  }

  if (error) {
    if (shouldUseRequestErrorPage(error)) {
      return <RequestErrorPage message={error} />;
    }
    return <div className="round-page">{error}</div>;
  }

  if (!round) {
    return <div className="round-page">라운드 정보를 불러올 수 없습니다.</div>;
  }

  const backTarget = compIdx ?? String(round.compIdx);
  const roundDateTime = formatRoundDateTime(round.eventStart, round.eventEnd);

  return (
    <div className="main-page">
      <PageHeader
        containerClassName="comp-header"
        titleClassName="page-title round-title-heading"
        title={
          <>
            <span className="round-title-event">{round.cubeEventName}</span>
            <span className="round-title-round">{round.roundName}</span>
          </>
        }
        subtitle={
          <>
            <span>{round.compName}</span>
            {roundDateTime ? (
              <>
                <span className="page-title-meta-divider">·</span>
                <span>{roundDateTime}</span>
              </>
            ) : null}
          </>
        }
        icon={
          <img
            src={getEventIconSrc(round.cubeEventName)}
            alt=""
            loading="lazy"
            onError={(event) => {
              const target = event.currentTarget;
              if (target.dataset.fallback === "true") {
                target.style.display = "none";
                return;
              }
              target.dataset.fallback = "true";
              target.src = `${import.meta.env.VITE_EVENT_ICON_BASE_URL}/Question.svg`;
            }}
          />
        }
        actions={[
          {
            label: "프로젝터 모드",
            iconSrc: "/page-title/projector.svg",
            to: `/admin/competition/${Number(backTarget)}/round/${Number(round.idx)}/projector`,
            adminOnly: true,
          },
          {
            label: "라운드 관리",
            iconSrc: "/icon/button/hammer.svg",
            to: `/admin/competition/${Number(backTarget)}/round/${Number(round.idx)}`,
            adminOnly: true,
          },
          {
            label: "라운드 목록",
            iconSrc: "/icon/button/back.svg",
            to: `/competition/${Number(backTarget)}`,
          },
          {
            label: "랭킹 홈",
            iconSrc: "/icon/button/home.svg",
            to: "/",
          },
        ]}
      />

      <section className="round-panel">
        <div className="round-panel-top">
          <div className="round-search-wrap">
            <label className="round-search">
              <span className="round-search-icon" aria-hidden="true">
                <img src="/icon/input/search.svg" alt="" aria-hidden="true" />
              </span>
              <input
                type="search"
                placeholder="이름 또는 CCK ID로 검색"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => {
                  if (search.trim()) {
                    setSearchOpen(true);
                  }
                }}
                onBlur={() => {
                  window.setTimeout(() => setSearchOpen(false), 120);
                }}
                onCompositionStart={() => setIsSearchComposing(true)}
                onCompositionEnd={() => setIsSearchComposing(false)}
                onKeyDown={(event) => {
                  if (isSearchComposing || event.nativeEvent.isComposing) {
                    return;
                  }
                  if (event.key === "ArrowDown") {
                    if (searchResults.length === 0) return;
                    event.preventDefault();
                    setSearchOpen(true);
                    setSearchActiveIndex((prev) => getNextSearchIndex(prev, 1));
                    return;
                  }
                  if (event.key === "ArrowUp") {
                    if (searchResults.length === 0) return;
                    event.preventDefault();
                    setSearchOpen(true);
                    setSearchActiveIndex((prev) => getNextSearchIndex(prev, -1));
                    return;
                  }
                  if (event.key === "Enter") {
                    if (searchResults.length === 0) return;
                    event.preventDefault();
                    const target = searchResults[searchActiveIndex >= 0 ? searchActiveIndex : 0];
                    if (target) {
                      applySearchSelection(target);
                    }
                    return;
                  }
                  if (event.key === "Escape") {
                    setSearchOpen(false);
                  }
                }}
                role="combobox"
                aria-expanded={searchOpen}
                aria-controls="round-search-suggestions"
                aria-autocomplete="list"
              />
            </label>
            {searchOpen && searchResults.length > 0 && (
              <div id="round-search-suggestions" className="round-search-suggestions" role="listbox">
                {searchResults.map((record, index) => (
                  <button
                    key={record.idx}
                    type="button"
                    className={`round-search-suggestion ${searchActiveIndex === index ? "round-search-suggestion--active" : ""}`}
                    aria-selected={searchActiveIndex === index}
                    ref={(node) => {
                      suggestionRefs.current[index] = node;
                    }}
                    onMouseEnter={() => setSearchActiveIndex(index)}
                    onMouseDown={() => applySearchSelection(record)}
                  >
                    <span className="round-search-suggestion-name">
                      {record.enName ? `${record.name} (${record.enName})` : record.name}
                    </span>
                    <span className="round-search-suggestion-meta">{record.cckId}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <RecordTable
          records={filteredRecords}
          emptyMessage={records.length === 0 ? "아직 기록이 없습니다." : "검색 결과가 없습니다."}
          advanceCount={round.advance}
          formatTimeValue={formatTimeValue}
          compactAttempts={compactRecordView}
          onSelect={(record, rank) => setSelectedRecord({ record, rank })}
        />
      </section>

      <RecordDetailModal
        selected={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        formatTimeValue={formatTimeValue}
      />
    </div>
  );
};
