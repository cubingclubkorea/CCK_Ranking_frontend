import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getSearchInfo, type SearchInfo } from "@/entities/auth";
import { getRound, type Round } from "@/entities/round";
import { getRecordList } from "@/entities/record";
import { addPlayer } from "@/features/record";
import { getErrorMessage as getRequestErrorMessage, shouldUseRequestErrorPage } from "@/shared";
import { OverlayToast, PageHeader, RoundRecordEditPageSkeleton } from "@/widgets";
import { RequestErrorPage } from "@/pages/error/RequestErrorPage.tsx";

type DraftCompetitor = {
  name: string;
  cckId: string;
  state: string;
  pdx: number;
  roundGroup: string;
};

const SEARCH_DEBOUNCE_MS = 220;

export const AddCompetitorPage = () => {
  const { compIdx, roundIdx } = useParams();
  const navigate = useNavigate();

  const [round, setRound] = useState<Round | null>(null);
  const [maxPdx, setMaxPdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<1 | 2>(1);
  const [keyword, setKeyword] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchInfo[]>([]);
  const [activeSearchIndex, setActiveSearchIndex] = useState(-1);
  const [selectedPlayers, setSelectedPlayers] = useState<SearchInfo[]>([]);
  const [draftRows, setDraftRows] = useState<DraftCompetitor[]>([]);
  const [saving, setSaving] = useState(false);

  const [status, setStatus] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const suggestionRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const toast = formError
    ? { variant: "error" as const, message: formError, onClose: () => setFormError(null) }
    : status
      ? { variant: "success" as const, message: status, onClose: () => setStatus(null) }
      : null;

  useEffect(() => {
    if (activeSearchIndex < 0 || !searchOpen) return;
    suggestionRefs.current[activeSearchIndex]?.scrollIntoView({ block: "nearest" });
  }, [activeSearchIndex, searchOpen]);

  useEffect(() => {
    let mounted = true;

    const fetchInitialData = async () => {
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
        const [roundData, records] = await Promise.all([
          getRound(Number(roundIdx)),
          getRecordList(Number(roundIdx)),
        ]);
        if (!mounted) return;
        setRound(roundData);
        const nextMaxPdx = records.reduce((max, record) => Math.max(max, record.pdx), 0);
        setMaxPdx(nextMaxPdx);
      } catch (fetchError) {
        console.error("선수 추가 초기 정보 조회 실패:", fetchError);
        if (mounted) {
          setError(getRequestErrorMessage(fetchError, "선수 추가 페이지 정보를 불러올 수 없습니다."));
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchInitialData();

    return () => {
      mounted = false;
    };
  }, [roundIdx]);

  useEffect(() => {
    if (step !== 1) return;
    const trimmed = keyword.trim();

    if (!trimmed) {
      setSearchResults([]);
      setSearchOpen(false);
      setSearching(false);
      setActiveSearchIndex(-1);
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      setSearching(true);
      try {
        const found = await getSearchInfo(trimmed);
        const filtered = found.filter(
          (item) => !selectedPlayers.some((player) => player.cckId === item.cckId)
        );
        setSearchResults(filtered.slice(0, 15));
        setSearchOpen(true);
        setActiveSearchIndex(filtered.length > 0 ? 0 : -1);
      } catch (searchError) {
        console.error("선수 검색 실패:", searchError);
        setSearchResults([]);
        setSearchOpen(false);
        setActiveSearchIndex(-1);
        setFormError(getRequestErrorMessage(searchError, "선수 검색에 실패했습니다."));
      } finally {
        setSearching(false);
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [keyword, selectedPlayers, step]);

  const groupOptions = useMemo(() => {
    if (!round?.roundGroupList) return [];
    return round.roundGroupList.filter((group) => group.trim().length > 0);
  }, [round?.roundGroupList]);

  const applySelectPlayer = (player: SearchInfo) => {
    if (selectedPlayers.some((item) => item.cckId === player.cckId)) return;
    setSelectedPlayers((prev) => [player, ...prev]);
    setKeyword("");
    setSearchResults([]);
    setSearchOpen(false);
    setActiveSearchIndex(-1);
    // 일부 입력 환경(IME)에서 마지막 글자가 남는 케이스를 방지
    window.setTimeout(() => {
      setKeyword("");
    }, 0);
  };

  const handleNextStep = () => {
    if (!roundIdx) {
      setFormError("라운드 정보가 없습니다.");
      return;
    }
    if (selectedPlayers.length === 0) {
      setFormError("먼저 선수를 한 명 이상 추가하세요.");
      return;
    }

    const existingByCckId = new Map(draftRows.map((row) => [row.cckId, row]));
    let nextPdx = Math.max(
      maxPdx + 1,
      ...draftRows.map((row) => row.pdx + 1).filter((value) => Number.isFinite(value))
    );

    const nextRows: DraftCompetitor[] = selectedPlayers.map((player) => {
      const existing = existingByCckId.get(player.cckId);
      if (existing) {
        return existing;
      }
      const created: DraftCompetitor = {
        name: player.name,
        cckId: player.cckId,
        state: player.state,
        pdx: nextPdx,
        roundGroup: groupOptions[0] ?? "",
      };
      nextPdx += 1;
      return created;
    });

    setDraftRows(nextRows);
    setStep(2);
    setFormError(null);
  };

  const handleRowChange = (cckId: string, patch: Partial<DraftCompetitor>) => {
    setDraftRows((prev) => prev.map((row) => (row.cckId === cckId ? { ...row, ...patch } : row)));
  };

  const handleDeleteFromStep2 = (cckId: string) => {
    setDraftRows((prev) => prev.filter((row) => row.cckId !== cckId));
  };

  const handleSubmit = async () => {
    if (!roundIdx) {
      setFormError("라운드 정보가 없습니다.");
      return;
    }
    if (draftRows.length === 0) {
      setFormError("추가할 선수가 없습니다.");
      return;
    }

    const hasInvalidPdx = draftRows.some((row) => Number.isNaN(row.pdx) || row.pdx <= 0);
    if (hasInvalidPdx) {
      setFormError("PDX는 1 이상의 숫자여야 합니다.");
      return;
    }

    const uniquePdxCount = new Set(draftRows.map((row) => row.pdx)).size;
    if (uniquePdxCount !== draftRows.length) {
      setFormError("PDX가 중복되었습니다. 각 선수의 PDX를 다르게 입력하세요.");
      return;
    }

    if (groupOptions.length > 0 && draftRows.some((row) => !row.roundGroup.trim())) {
      setFormError("모든 선수의 그룹을 선택하세요.");
      return;
    }

    setSaving(true);
    setFormError(null);
    setStatus(null);

    try {
      await addPlayer(
        draftRows.map((row) => ({
          pdx: row.pdx,
          name: row.name,
          state: row.state,
          cckId: row.cckId,
          roundIdx: Number(roundIdx),
          roundGroup: row.roundGroup,
        }))
      );

      setStatus(`${draftRows.length}명의 선수를 추가했습니다.`);
      setSelectedPlayers([]);
      setDraftRows([]);
      setKeyword("");
      setStep(1);

      const nextMax = draftRows.reduce((max, row) => Math.max(max, row.pdx), maxPdx);
      setMaxPdx(nextMax);
    } catch (saveError) {
      console.error("선수 일괄 추가 실패:", saveError);
      setFormError(getRequestErrorMessage(saveError, "선수 추가에 실패했습니다."));
    } finally {
      setSaving(false);
    }
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!searchOpen || searchResults.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSearchIndex((prev) => {
        if (prev < 0) return 0;
        return (prev + 1) % searchResults.length;
      });
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSearchIndex((prev) => {
        if (prev < 0) return searchResults.length - 1;
        return (prev - 1 + searchResults.length) % searchResults.length;
      });
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const pickIndex = activeSearchIndex >= 0 ? activeSearchIndex : 0;
      const target = searchResults[pickIndex];
      if (target) applySelectPlayer(target);
    }
  };

  if (loading) {
    return <RoundRecordEditPageSkeleton />;
  }

  if (error) {
    if (shouldUseRequestErrorPage(error)) {
      return <RequestErrorPage message={error} />;
    }
    return <div className="round-page">{error}</div>;
  }

  if (!round || !roundIdx) {
    return <div className="round-page">라운드 정보를 불러올 수 없습니다.</div>;
  }

  const resolvedCompIdx = compIdx ?? String(round.compIdx);

  return (
    <div className="admin-page add-competitor-page">
      <OverlayToast
        open={!!toast}
        variant={toast?.variant}
        message={toast?.message ?? ""}
        onClose={toast?.onClose}
      />
      <PageHeader
        containerClassName="comp-header"
        iconSrc="/icon/button/hammer.svg"
        title="선수 추가"
        subtitle={`${round.compName} · ${round.cubeEventName} ${round.roundName}`}
        actions={[
          {
            label: "라운드 관리로 돌아가기",
            iconSrc: "/icon/button/back.svg",
            to: `/admin/competition/${Number(resolvedCompIdx)}/round/${Number(round.idx)}`,
          },
        ]}
      />

      <section className="record-edit-panel add-competitor-panel">
        <div className="round-panel-title add-competitor-title-row">
          <h2>{step === 1 ? "선수 추가" : "선수 정보 입력"}</h2>
          <span className="add-competitor-step">{step}/2</span>
        </div>

        {step === 1 ? (
          <div className="record-edit-form">
            <div className="record-edit-field record-edit-search">
              <label className="record-edit-label" htmlFor="add-competitor-search">
                선수 검색
              </label>
              <div className="record-edit-input-wrap">
                <input
                  id="add-competitor-search"
                  className="record-edit-input"
                  type="search"
                  placeholder="이름 입력"
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  onFocus={() => setSearchOpen(searchResults.length > 0)}
                  onBlur={() => {
                    window.setTimeout(() => {
                      setSearchOpen(false);
                    }, 80);
                  }}
                  onKeyDown={handleSearchKeyDown}
                />
                <span className="record-edit-search-icon" aria-hidden="true">
                  <img src="/icon/input/search.svg" alt="" aria-hidden="true" />
                </span>
              </div>

              {searchOpen && searchResults.length > 0 ? (
                <div className="record-edit-suggestions" role="listbox">
                  {searchResults.map((item, index) => (
                    <button
                      key={item.cckId}
                      type="button"
                      className={`record-edit-suggestion ${activeSearchIndex === index ? "record-edit-suggestion--active" : ""}`}
                      ref={(node) => {
                        suggestionRefs.current[index] = node;
                      }}
                      onMouseEnter={() => setActiveSearchIndex(index)}
                      onMouseDown={() => applySelectPlayer(item)}
                    >
                      <span className="record-edit-suggestion-name">{item.name}</span>
                      <span className="record-edit-suggestion-meta">{item.cckId}</span>
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {searching ? <div className="record-edit-help">검색 중...</div> : null}

            <div className="record-edit-section">
              <div className="record-edit-section-title">추가 대상 ({selectedPlayers.length}명)</div>
              {selectedPlayers.length === 0 ? (
                <div className="record-no-show-empty">추가할 선수를 검색해 선택하세요.</div>
              ) : (
                <div className="add-competitor-selected-list">
                  {selectedPlayers.map((player) => (
                    <div key={player.cckId} className="add-competitor-selected-item">
                      <div>
                        <div className="add-competitor-selected-name">{player.name}</div>
                        <div className="add-competitor-selected-id">{player.cckId}</div>
                      </div>
                      <button
                        type="button"
                        className="record-edit-mini-btn record-edit-mini-btn--danger"
                        onClick={() => {
                          setSelectedPlayers((prev) => prev.filter((item) => item.cckId !== player.cckId));
                        }}
                      >
                        제거
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="record-edit-actions">
              <button
                className="record-edit-btn record-edit-btn--ghost"
                type="button"
                onClick={() => navigate(`/admin/competition/${Number(resolvedCompIdx)}/round/${Number(round.idx)}`)}
              >
                취소
              </button>
              <button
                className="record-edit-btn record-edit-btn--primary"
                type="button"
                onClick={handleNextStep}
                disabled={selectedPlayers.length === 0}
              >
                다음 단계
              </button>
            </div>
          </div>
        ) : (
          <div className="record-edit-form">
            <div className="add-competitor-table-wrap">
              <table className="admin-table add-competitor-table">
                <thead>
                  <tr>
                    <th>이름</th>
                    <th>CCK ID</th>
                    <th>PDX</th>
                    <th>그룹</th>
                    <th>제거</th>
                  </tr>
                </thead>
                <tbody>
                  {draftRows.map((row) => (
                    <tr key={row.cckId}>
                      <td>{row.name}</td>
                      <td className="admin-id">{row.cckId}</td>
                      <td>
                        <input
                          className="record-edit-input add-competitor-input"
                          type="number"
                          min={1}
                          value={row.pdx}
                          onChange={(event) => {
                            handleRowChange(row.cckId, { pdx: Number(event.target.value) });
                          }}
                        />
                      </td>
                      <td>
                        <select
                          className="record-edit-input add-competitor-input"
                          value={row.roundGroup}
                          onChange={(event) => {
                            handleRowChange(row.cckId, { roundGroup: event.target.value });
                          }}
                        >
                          {groupOptions.length === 0 ? <option value="">그룹 없음</option> : null}
                          {groupOptions.map((group) => (
                            <option key={group} value={group}>
                              {group}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="record-edit-mini-btn record-edit-mini-btn--danger"
                          onClick={() => handleDeleteFromStep2(row.cckId)}
                        >
                          제거
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="record-edit-actions">
              <button
                className="record-edit-btn record-edit-btn--ghost"
                type="button"
                onClick={() => {
                  const cckIdSet = new Set(draftRows.map((row) => row.cckId));
                  setSelectedPlayers((prev) => prev.filter((player) => cckIdSet.has(player.cckId)));
                  setStep(1);
                }}
                disabled={saving}
              >
                이전 단계
              </button>
              <button
                className="record-edit-btn record-edit-btn--primary"
                type="button"
                onClick={handleSubmit}
                disabled={saving || draftRows.length === 0}
              >
                {saving ? "추가 중..." : "모두 추가"}
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
