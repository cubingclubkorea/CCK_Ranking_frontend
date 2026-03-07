import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Gender, getSearchInfo, type SearchInfo } from "@/entities/auth";
import { getAuthInfo } from "@/entities/authInfo";
import {
  getCompetitionFuture,
  getCompetitionNow,
  getCompetitionPast,
  type Competition,
} from "@/entities/competition";
import { getCubeEventList } from "@/entities/cubeEvent";
import type { GlobalSingleRankingRecord } from "@/entities/statistics";
import {
  formatTimeValue,
  getRankingEventNames,
  getRankingRecords,
  sortEventNames,
  type RankingRecordMetric,
} from "@/features/ranking";
import {
  mapRegionKeyToLabel,
  mapRegionName,
  REGION_FILTER_OPTIONS,
  resolveAverageValue,
  resolveRegionKey,
} from "@/shared";
import { PageHeader } from "@/widgets";

type SearchScope = "all" | "player" | "competition" | "record";
type RecordMetricFilter = "all" | RankingRecordMetric;

type ScopeOption = {
  value: SearchScope;
  label: string;
};

const SEARCH_SCOPE_OPTIONS: ScopeOption[] = [
  { value: "all", label: "전체" },
  { value: "player", label: "선수" },
  { value: "competition", label: "대회" },
  { value: "record", label: "기록" },
];

const DEFAULT_REGION = "전체 지역";
const DEFAULT_RECORD_METRIC: RecordMetricFilter = "all";

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatCompetitionPeriod = (startDate: Date, endDate: Date) => {
  const sameDay =
    startDate.getFullYear() === endDate.getFullYear() &&
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getDate() === endDate.getDate();

  if (sameDay) return formatDate(startDate);
  return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
};

const matchesKeyword = (value: string | null | undefined, keyword: string) =>
  typeof value === "string" && value.toLowerCase().includes(keyword);

const normalizeRegionParam = (raw: string | null) => {
  if (!raw) return DEFAULT_REGION;
  return mapRegionKeyToLabel(raw) ?? raw;
};

const looksLikeCckId = (value: string) => /^[A-Za-z0-9_-]{4,}$/.test(value.trim());

const buildPlayersFromRows = (rows: GlobalSingleRankingRecord[]) => {
  const map = new Map<string, SearchInfo>();
  rows.forEach((row) => {
    if (!row.cckId) return;
    if (!map.has(row.cckId)) {
      map.set(row.cckId, {
        name: row.name,
        enName: "",
        state: row.state ?? "",
        gender: Gender.Unknown,
        cckId: row.cckId,
        wcaId: "",
      });
    }
  });
  return Array.from(map.values());
};

const filterPlayers = (players: SearchInfo[], keyword: string, region: string) => {
  const list = players.filter((player) => {
    const regionLabel = mapRegionName(player.state) ?? player.state;
    const regionMatched = region === DEFAULT_REGION || regionLabel === region;
    if (!regionMatched) return false;

    return (
      matchesKeyword(player.name, keyword) ||
      matchesKeyword(player.enName, keyword) ||
      matchesKeyword(player.cckId, keyword) ||
      matchesKeyword(regionLabel, keyword)
    );
  });

  return list.slice(0, 80);
};

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [scope, setScope] = useState<SearchScope>(() => {
    const raw = searchParams.get("scope");
    if (raw === "player" || raw === "competition" || raw === "record") return raw;
    return "all";
  });
  const [playerRegion, setPlayerRegion] = useState<string>(() => normalizeRegionParam(searchParams.get("playerRegion")));
  const [selectedEvent, setSelectedEvent] = useState(searchParams.get("event") ?? "");
  const [recordMetric, setRecordMetric] = useState<RecordMetricFilter>(() => {
    const raw = searchParams.get("recordMetric");
    if (raw === "single" || raw === "average") return raw;
    return "all";
  });

  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [competitionLoading, setCompetitionLoading] = useState(true);
  const [competitionError, setCompetitionError] = useState<string | null>(null);

  const [playerResults, setPlayerResults] = useState<SearchInfo[]>([]);
  const [playerLoading, setPlayerLoading] = useState(false);
  const [playerError, setPlayerError] = useState<string | null>(null);

  const [eventNames, setEventNames] = useState<string[]>([]);
  const [eventLoading, setEventLoading] = useState(false);

  const [recordRows, setRecordRows] = useState<GlobalSingleRankingRecord[]>([]);
  const [recordLoading, setRecordLoading] = useState(false);
  const [recordError, setRecordError] = useState<string | null>(null);

  const rankingCacheRef = useRef(new Map<string, GlobalSingleRankingRecord[]>());
  const authInfoCacheRef = useRef(new Map<string, SearchInfo>());

  const rawKeyword = useMemo(() => query.trim(), [query]);
  const keyword = useMemo(() => rawKeyword.toLowerCase(), [rawKeyword]);
  const hasKeyword = rawKeyword.length > 0;

  const includePlayers = scope === "all" || scope === "player";
  const includeCompetitions = scope === "all" || scope === "competition";
  const includeRecords = scope === "all" || scope === "record";
  const showRecordFilters = scope === "record";
  const showPlayerRegionFilter = scope === "player";

  useEffect(() => {
    const next = new URLSearchParams();

    if (query.trim()) next.set("q", query.trim());
    if (scope !== "all") next.set("scope", scope);

    if (playerRegion !== DEFAULT_REGION) {
      next.set("playerRegion", resolveRegionKey(playerRegion) ?? playerRegion);
    }

    if (selectedEvent) next.set("event", selectedEvent);
    if (recordMetric !== DEFAULT_RECORD_METRIC) next.set("recordMetric", recordMetric);

    if (next.toString() !== searchParams.toString()) {
      setSearchParams(next, { replace: true });
    }
  }, [playerRegion, query, recordMetric, scope, searchParams, selectedEvent, setSearchParams]);

  useEffect(() => {
    let mounted = true;

    const fetchCompetitionList = async () => {
      setCompetitionLoading(true);
      setCompetitionError(null);

      try {
        const [future, now, past] = await Promise.all([
          getCompetitionFuture({ page: 0, size: 200 }),
          getCompetitionNow({ page: 0, size: 200 }),
          getCompetitionPast({ page: 0, size: 200 }),
        ]);

        if (!mounted) return;

        const dedupedMap = new Map<number, Competition>();
        [...future.content, ...now.content, ...past.content].forEach((item) => {
          dedupedMap.set(item.idx, item);
        });
        const merged = Array.from(dedupedMap.values()).sort(
          (a, b) => b.compDateStart.getTime() - a.compDateStart.getTime()
        );

        setCompetitions(merged);
      } catch (error) {
        if (!mounted) return;
        console.error("통합 검색 대회 목록 조회 실패:", error);
        setCompetitionError("대회 목록을 불러오지 못했습니다.");
      } finally {
        if (mounted) setCompetitionLoading(false);
      }
    };

    fetchCompetitionList();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const fetchEvents = async () => {
      setEventLoading(true);
      try {
        const eventList = await getCubeEventList();
        const names = sortEventNames(Array.from(new Set(eventList.map((event) => event.eventName))));
        if (!cancelled && names.length > 0) {
          setEventNames(names);
          return;
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("종목 목록 조회 실패, 랭킹 종목 목록 폴백 사용:", error);
        }
      }

      try {
        const names = await getRankingEventNames();
        const resolved = sortEventNames(Array.from(new Set(names)));
        if (!cancelled && resolved.length > 0) {
          setEventNames(resolved);
          return;
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("랭킹 종목 목록 조회 실패, 기본 종목 폴백 사용:", error);
        }
      }

      if (!cancelled) {
        setEventNames(["3x3x3", "2x2x2", "4x4x4", "Pyraminx", "Skewb"]);
      }
      if (!cancelled) setEventLoading(false);
    };

    fetchEvents();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (eventNames.length === 0) return;
    if (selectedEvent && eventNames.includes(selectedEvent)) return;
    setSelectedEvent(eventNames[0]);
  }, [eventNames, selectedEvent]);

  useEffect(() => {
    if (!includeRecords || !hasKeyword || !selectedEvent) {
      setRecordRows([]);
      setRecordLoading(false);
      setRecordError(null);
      return;
    }

    let cancelled = false;

    const fetchRecords = async () => {
      setRecordLoading(true);
      setRecordError(null);
      try {
        const singleKey = `single:${selectedEvent}`;
        const averageKey = `average:${selectedEvent}`;

        const singleRows = rankingCacheRef.current.get(singleKey) ?? await getRankingRecords("single", selectedEvent, 200);
        const averageRows = rankingCacheRef.current.get(averageKey) ?? await getRankingRecords("average", selectedEvent, 200);

        if (!rankingCacheRef.current.has(singleKey)) rankingCacheRef.current.set(singleKey, singleRows);
        if (!rankingCacheRef.current.has(averageKey)) rankingCacheRef.current.set(averageKey, averageRows);
        if (cancelled) return;

        const merged = new Map<number, GlobalSingleRankingRecord>();
        [...singleRows, ...averageRows].forEach((row) => merged.set(row.idx, row));
        setRecordRows(Array.from(merged.values()));
      } catch (error) {
        if (cancelled) return;
        console.error("기록 검색 데이터 조회 실패:", error);
        setRecordRows([]);
        setRecordError("기록 검색 결과를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setRecordLoading(false);
      }
    };

    fetchRecords();

    return () => {
      cancelled = true;
    };
  }, [hasKeyword, includeRecords, selectedEvent]);

  useEffect(() => {
    if (!includePlayers || !hasKeyword) {
      setPlayerResults([]);
      setPlayerLoading(false);
      setPlayerError(null);
      return;
    }

    let cancelled = false;

    const getFallbackRows = async () => {
      const eventsToScan = selectedEvent
        ? [selectedEvent, ...eventNames.filter((name) => name !== selectedEvent).slice(0, 4)]
        : eventNames.slice(0, 5);

      const settled = await Promise.allSettled(
        eventsToScan.map(async (eventName) => {
          const key = `single:${eventName}`;
          if (rankingCacheRef.current.has(key)) {
            return rankingCacheRef.current.get(key) ?? [];
          }
          const rows = await getRankingRecords("single", eventName, 200);
          rankingCacheRef.current.set(key, rows);
          return rows;
        })
      );

      return settled
        .filter((result): result is PromiseFulfilledResult<GlobalSingleRankingRecord[]> => result.status === "fulfilled")
        .flatMap((result) => result.value);
    };

    const run = async () => {
      setPlayerLoading(true);
      setPlayerError(null);
      let usedSearchApi = false;
      try {
        const apiData = await getSearchInfo(rawKeyword);
        usedSearchApi = true;
        if (cancelled) return;
        const filtered = filterPlayers(apiData, keyword, playerRegion);
        if (filtered.length > 0) {
          setPlayerResults(filtered);
          return;
        }
      } catch (error) {
        if (!cancelled) {
          console.warn("선수 검색 API 실패, 프로필/랭킹 폴백 실행:", error);
        }
      }

      try {
        const fallbackRows = await getFallbackRows();
        if (cancelled) return;

        const basePlayers = buildPlayersFromRows(fallbackRows);
        const candidates = filterPlayers(basePlayers, keyword, playerRegion);

        const enrichTargets = candidates.slice(0, 20).map((player) => player.cckId);
        if (looksLikeCckId(rawKeyword)) {
          enrichTargets.unshift(rawKeyword.trim());
        }

        const uniqueTargets = Array.from(new Set(enrichTargets));

        const settled = await Promise.allSettled(
          uniqueTargets.map(async (cckId) => {
            if (authInfoCacheRef.current.has(cckId)) {
              return authInfoCacheRef.current.get(cckId) as SearchInfo;
            }
            const info = await getAuthInfo(cckId);
            const mapped: SearchInfo = {
              name: info.name,
              enName: info.enName,
              state: info.state,
              gender:
                info.gender === "Male"
                  ? Gender.Male
                  : info.gender === "Female"
                    ? Gender.Female
                    : Gender.Unknown,
              cckId: info.cckId,
              wcaId: "",
            };
            authInfoCacheRef.current.set(cckId, mapped);
            return mapped;
          })
        );

        const enriched = settled
          .filter((result): result is PromiseFulfilledResult<SearchInfo> => result.status === "fulfilled")
          .map((result) => result.value);

        const merged = new Map<string, SearchInfo>();
        [...enriched, ...candidates].forEach((player) => {
          merged.set(player.cckId, player);
        });

        const finalPlayers = filterPlayers(Array.from(merged.values()), keyword, playerRegion);
        setPlayerResults(finalPlayers);
        setPlayerError(finalPlayers.length === 0 && usedSearchApi ? "일치하는 선수가 없습니다." : null);
      } catch (fallbackError) {
        if (cancelled) return;
        console.error("선수 검색 폴백 실패:", fallbackError);
        setPlayerResults([]);
        setPlayerError("선수 검색 결과를 불러오지 못했습니다.");
      } finally {
        if (!cancelled) setPlayerLoading(false);
      }
    };

    const timer = window.setTimeout(run, 250);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [eventNames, hasKeyword, includePlayers, keyword, playerRegion, rawKeyword, selectedEvent]);

  const playerRegionOptions = useMemo(
    () => [DEFAULT_REGION, ...REGION_FILTER_OPTIONS],
    []
  );

  const filteredCompetitions = useMemo(() => {
    if (!includeCompetitions || !hasKeyword) return [];

    return competitions
      .filter((competition) => {
        return (
          matchesKeyword(competition.compName, keyword) ||
          matchesKeyword(competition.location, keyword) ||
          matchesKeyword(formatDate(competition.compDateStart), keyword) ||
          matchesKeyword(formatDate(competition.compDateEnd), keyword)
        );
      })
      .slice(0, 80);
  }, [competitions, hasKeyword, includeCompetitions, keyword]);

  const filteredRecords = useMemo(() => {
    if (!includeRecords || !hasKeyword) return [];

    const matched = recordRows.filter((row) => {
      const average = resolveAverageValue(row.attempts, row.avgCalc, row.average);
      const singleText = formatTimeValue(row.single);
      const averageText = formatTimeValue(average);

      const passMetric =
        recordMetric === "all" ||
        (recordMetric === "single" && row.single !== null) ||
        (recordMetric === "average" && average !== null && average !== undefined);

      return (
        passMetric &&
        (matchesKeyword(row.name, keyword) ||
          matchesKeyword(row.cckId, keyword) ||
          matchesKeyword(row.compName, keyword) ||
          matchesKeyword(row.eventName, keyword) ||
          matchesKeyword(mapRegionName(row.state), keyword) ||
          matchesKeyword(singleText, keyword) ||
          matchesKeyword(averageText, keyword))
      );
    });

    return matched
      .sort((a, b) => {
        const averageA = resolveAverageValue(a.attempts, a.avgCalc, a.average);
        const averageB = resolveAverageValue(b.attempts, b.avgCalc, b.average);

        const valueA =
          recordMetric === "single"
            ? a.single
            : recordMetric === "average"
              ? averageA
              : a.single ?? averageA ?? Number.POSITIVE_INFINITY;
        const valueB =
          recordMetric === "single"
            ? b.single
            : recordMetric === "average"
              ? averageB
              : b.single ?? averageB ?? Number.POSITIVE_INFINITY;

        const safeA = typeof valueA === "number" ? valueA : Number.POSITIVE_INFINITY;
        const safeB = typeof valueB === "number" ? valueB : Number.POSITIVE_INFINITY;
        if (safeA !== safeB) return safeA - safeB;
        return a.ranking - b.ranking;
      })
      .slice(0, 80);
  }, [hasKeyword, includeRecords, keyword, recordMetric, recordRows]);

  const hasAnyResult =
    filteredCompetitions.length > 0 || playerResults.length > 0 || filteredRecords.length > 0;

  return (
    <div className="main-page search-page">
      <PageHeader
        containerClassName="comp-header search-header"
        iconSrc="/icon/sidebar/search.svg"
        title="검색"
        subtitle="Search."
      />

      <section className="search-panel">
        <div className="search-controls">
          <label className="search-bar" htmlFor="search-page-input">
            <span className="round-search-icon" aria-hidden="true">
              <img src="/icon/sidebar/search.svg" alt="" aria-hidden="true" />
            </span>
            <input
              className="search-bar-input"
              id="search-page-input"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="선수명, CCK ID, 대회명, 종목명, 기록값(예: 13.41)"
              autoComplete="off"
            />
          </label>

          <div className="search-filter-board">
            <div className="search-filter-row">
              <div className="search-filter-title">검색 범위</div>
              <div className="search-scope-tabs" role="tablist" aria-label="검색 범위 선택">
                {SEARCH_SCOPE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`search-scope-tab ${scope === option.value ? "active" : ""}`.trim()}
                    onClick={() => setScope(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {showPlayerRegionFilter ? (
              <div className="search-filter-row">
                <div className="search-filter-title">선수 지역</div>
                <label className="search-record-filter">
                  <span>지역</span>
                  <select
                    value={playerRegion}
                    onChange={(event) => setPlayerRegion(event.target.value)}
                    aria-label="선수 지역 필터"
                  >
                    {playerRegionOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            ) : null}

            {showRecordFilters ? (
              <div className="search-filter-row search-filter-row--record">
                <div className="search-filter-title">기록 필터</div>
                <label className="search-record-filter">
                  <span>종목</span>
                  <select
                    value={selectedEvent}
                    onChange={(event) => setSelectedEvent(event.target.value)}
                    disabled={eventLoading || eventNames.length === 0}
                    aria-label="기록 검색 종목"
                  >
                    {eventNames.length === 0 ? <option value="">종목 없음</option> : null}
                    {eventNames.map((eventName) => (
                      <option key={eventName} value={eventName}>
                        {eventName}
                      </option>
                    ))}
                  </select>
                </label>

                <div className="search-record-metric" role="tablist" aria-label="기록 필터">
                  <button
                    type="button"
                    className={`search-record-metric-tab ${recordMetric === "all" ? "active" : ""}`.trim()}
                    onClick={() => setRecordMetric("all")}
                  >
                    전체
                  </button>
                  <button
                    type="button"
                    className={`search-record-metric-tab ${recordMetric === "single" ? "active" : ""}`.trim()}
                    onClick={() => setRecordMetric("single")}
                  >
                    최고
                  </button>
                  <button
                    type="button"
                    className={`search-record-metric-tab ${recordMetric === "average" ? "active" : ""}`.trim()}
                    onClick={() => setRecordMetric("average")}
                  >
                    평균
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {!hasKeyword ? (
          <div className="search-empty-hint">검색어를 입력하면 결과를 보여줍니다.</div>
        ) : (
          <>
            <div className="search-result-summary">
              {includePlayers ? <span>선수 {playerResults.length}건</span> : null}
              {includeCompetitions ? <span>대회 {filteredCompetitions.length}건</span> : null}
              {includeRecords ? <span>기록 {filteredRecords.length}건</span> : null}
            </div>

            {includePlayers ? (
              <section className="search-result-section">
                <div className="search-result-head">
                  <h2>선수 검색</h2>
                  {playerLoading ? <span>불러오는 중...</span> : null}
                  {!playerLoading && playerError ? <span>{playerError}</span> : null}
                </div>
                <div className="search-result-grid">
                  {!playerLoading && !playerError && playerResults.length === 0 ? (
                    <div className="search-result-empty">일치하는 선수가 없습니다.</div>
                  ) : (
                    playerResults.map((player) => (
                      <Link className="search-result-card" key={`${player.cckId}-${player.name}`} to={`/profile/${encodeURIComponent(player.cckId)}`}>
                        <div className="search-result-title-row">
                          <strong>{player.name}</strong>
                        </div>
                        <p>{player.cckId}</p>
                        <p>{player.enName || "-"}</p>
                        <p>{mapRegionName(player.state) ?? player.state}</p>
                      </Link>
                    ))
                  )}
                </div>
              </section>
            ) : null}

            {includeCompetitions ? (
              <section className="search-result-section">
                <div className="search-result-head">
                  <h2>대회 검색</h2>
                  {competitionLoading ? <span>불러오는 중...</span> : null}
                  {!competitionLoading && competitionError ? <span>{competitionError}</span> : null}
                </div>
                <div className="search-result-grid">
                  {!competitionLoading && !competitionError && filteredCompetitions.length === 0 ? (
                    <div className="search-result-empty">일치하는 대회가 없습니다.</div>
                  ) : (
                    filteredCompetitions.map((competition) => (
                      <Link className="search-result-card" key={competition.idx} to={`/competition/${competition.idx}`}>
                        <div className="search-result-title-row">
                          <strong>{competition.compName}</strong>
                        </div>
                        <p>{formatCompetitionPeriod(competition.compDateStart, competition.compDateEnd)}</p>
                        <p>{competition.location || "장소 미정"}</p>
                      </Link>
                    ))
                  )}
                </div>
              </section>
            ) : null}

            {includeRecords ? (
              <section className="search-result-section">
                <div className="search-result-head">
                  <h2>기록 검색</h2>
                  {recordLoading ? <span>불러오는 중...</span> : null}
                  {!recordLoading && recordError ? <span>{recordError}</span> : null}
                </div>
                <div className="search-result-grid">
                  {!recordLoading && !recordError && filteredRecords.length === 0 ? (
                    <div className="search-result-empty">일치하는 기록이 없습니다.</div>
                  ) : (
                    filteredRecords.map((row) => (
                      <Link
                        className="search-result-card"
                        key={`${row.idx}-${row.cckId}-${row.eventName}`}
                        to={`/competition/${row.compIdx}/round/${row.roundIdx}/record/${row.idx}`}
                      >
                        <div className="search-result-title-row">
                          <strong>{row.name}</strong>
                          <span className="search-result-badge">#{row.ranking}</span>
                        </div>
                        <p>{row.cckId}</p>
                        <p>
                          {row.eventName} · 최고 {formatTimeValue(row.single)} · 평균{" "}
                          {formatTimeValue(resolveAverageValue(row.attempts, row.avgCalc, row.average))}
                        </p>
                        <p>{row.compName}</p>
                      </Link>
                    ))
                  )}
                </div>
              </section>
            ) : null}

            {!playerLoading &&
            !competitionLoading &&
            !recordLoading &&
            !playerError &&
            !competitionError &&
            !recordError &&
            !hasAnyResult ? (
              <div className="search-empty-hint">현재 조건에서 검색 결과가 없습니다.</div>
            ) : null}
          </>
        )}
      </section>
    </div>
  );
};
