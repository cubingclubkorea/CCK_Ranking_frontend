import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getAuthInfoByRfid } from "@/entities/authInfo";
import { getCompetition } from "@/entities/competition";
import type { Competition } from "@/entities/competition";
import type { ScrambleResponse } from "@/entities/scramble";
import { updateScrambler } from "@/features/scramble";
import { OverlayToast, PageHeader } from "@/widgets";
import { hasKoreanChar, parseTaggedCard, type TaggedCard } from "./utils/tagParser";

const getErrorMessage = (error: unknown) => {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "알 수 없는 오류가 발생했습니다.";
};

export const ScrambleAdminPage = () => {
  const { compIdx } = useParams();
  const navigate = useNavigate();
  const competitionId = useMemo(() => Number(compIdx), [compIdx]);

  const [competition, setCompetition] = useState<Competition | null>(null);
  const [pageError, setPageError] = useState<string | null>(null);

  const [scramblerInput, setScramblerInput] = useState("");
  const [playerInput, setPlayerInput] = useState("");

  const [scramblerCard, setScramblerCard] = useState<TaggedCard | null>(null);
  const [playerCard, setPlayerCard] = useState<TaggedCard | null>(null);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScrambleResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const hasScrambler = Boolean(scramblerCard?.uid);
  const scramblerInputRef = useRef<HTMLInputElement | null>(null);
  const playerInputRef = useRef<HTMLInputElement | null>(null);

  const enrichCardInfoByRfid = async (card: TaggedCard): Promise<TaggedCard> => {
    try {
      const authInfo = await getAuthInfoByRfid(card.uid);
      const resolvedName = authInfo.name?.trim();
      const resolvedCckId = authInfo.cckId?.trim();
      return {
        ...card,
        name: resolvedName || card.name,
        cckId: resolvedCckId || card.cckId,
      };
    } catch {
      return card;
    }
  };

  useEffect(() => {
    if (!Number.isFinite(competitionId) || competitionId <= 0) {
      setPageError("대회 정보가 올바르지 않습니다.");
      return;
    }

    let mounted = true;

    const fetchCompetition = async () => {
      try {
        const data = await getCompetition(competitionId);
        if (!mounted) return;
        setCompetition(data);
      } catch (fetchError) {
        if (!mounted) return;
        setPageError(getErrorMessage(fetchError));
      }
    };

    fetchCompetition();

    return () => {
      mounted = false;
    };
  }, [competitionId]);

  useEffect(() => {
    if (hasScrambler) {
      playerInputRef.current?.focus();
      return;
    }
    scramblerInputRef.current?.focus();
  }, [hasScrambler]);

  const handleScramblerTag = async () => {
    const rawScramblerInput = scramblerInput;
    if (hasKoreanChar(rawScramblerInput)) {
      setNotice(null);
      setError("한글 입력이 감지되었습니다. 입력기를 영어로 변경한 뒤 다시 태그하세요.");
      setScramblerInput("");
      return;
    }

    const parsed = parseTaggedCard(rawScramblerInput);
    if (!parsed) {
      setNotice(null);
      setError("스크램블러 카드를 인식하지 못했습니다.");
      setScramblerInput("");
      return;
    }

    const resolvedScrambler = await enrichCardInfoByRfid(parsed);

    setScramblerCard(resolvedScrambler);
    setScramblerInput("");
    setNotice("스크램블러가 등록되었습니다.");
    setError(null);
  };

  const handleResetScrambler = () => {
    setScramblerCard(null);
    setResult(null);
    setPlayerCard(null);
    setPlayerInput("");
    setNotice(null);
    setError(null);
  };

  const handlePlayerTag = async () => {
    if (!scramblerCard?.uid) {
      setNotice(null);
      setError("먼저 스크램블러 카드를 태그하세요.");
      return;
    }

    const rawPlayerInput = playerInput;
    if (hasKoreanChar(rawPlayerInput)) {
      setNotice(null);
      setError("한글 입력이 감지되었습니다. 입력기를 영어로 변경한 뒤 다시 태그하세요.");
      setPlayerInput("");
      return;
    }

    const parsedPlayer = parseTaggedCard(rawPlayerInput);
    setPlayerInput("");
    if (!parsedPlayer) {
      setNotice(null);
      setError("선수 카드를 인식하지 못했습니다.");
      return;
    }

    if (parsedPlayer.uid === scramblerCard.uid) {
      setNotice(null);
      setError("스크램블러와 선수는 동일할 수 없습니다.");
      return;
    }

    const resolvedPlayer = await enrichCardInfoByRfid(parsedPlayer);

    setLoading(true);
    setError(null);

    try {
      const data = await updateScrambler({
        compIdx: competitionId,
        playerUid: resolvedPlayer.uid,
        scramblerUid: scramblerCard.uid,
      });

      setPlayerCard(resolvedPlayer);
      setResult(data);
    } catch (requestError) {
      setNotice(null);
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
      requestAnimationFrame(() => {
        playerInputRef.current?.focus();
      });
    }
  };

  if (pageError) {
    return (
      <div className="admin-page">
        <OverlayToast
          open={true}
          variant="error"
          message={pageError}
          onClose={() => navigate("/admin/competition")}
        />
      </div>
    );
  }

  const toast = error
    ? { variant: "error" as const, message: error, onClose: () => setError(null) }
    : notice
      ? { variant: "success" as const, message: notice, onClose: () => setNotice(null) }
      : null;

  return (
    <div className="admin-page scramble-admin-page">
      <OverlayToast
        open={!!toast}
        variant={toast?.variant}
        message={toast?.message ?? ""}
        onClose={toast?.onClose}
      />

      <PageHeader
        containerClassName="admin-header"
        iconSrc="/icon/button/cube.svg"
        title={competition ? competition.compName : <div className="ui-skeleton ui-skeleton-title" aria-hidden="true" />}
        subtitle="스크램블 모드"
        actions={[
          {
            label: "대회로 돌아가기",
            iconSrc: "/icon/button/back.svg",
            onClick: () => navigate(`/competition/${competitionId}`),
            disabled: !competitionId,
          },
          {
            label: "대회 페이지 보기",
            iconSrc: "/icon/button/home.svg",
            onClick: () => navigate(`/competition/${competitionId}`),
            disabled: !competitionId,
          },
        ]}
      />

      <section className="scramble-admin-layout">
        <div className="scramble-admin-top-grid">
          <section className="scramble-admin-card scramble-admin-top-card">
            <h2 className="scramble-admin-title">스크램블러</h2>

            <div className="scramble-admin-top-body">
              {!hasScrambler ? (
                <div
                  className="scramble-admin-tag-wait scramble-admin-tag-wait--active"
                  onClick={() => {
                    scramblerInputRef.current?.focus();
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      scramblerInputRef.current?.focus();
                    }
                  }}
                >
                  <img className="scramble-admin-tag-wait-icon" src="/icon/sidebar/card.svg" alt="" aria-hidden="true" />
                  <span className="scramble-admin-tag-wait-text">스크램블러 카드를 태그하세요</span>
                  <input
                    ref={scramblerInputRef}
                    className="scramble-admin-hidden-input"
                    type="text"
                    value={scramblerInput}
                    onChange={(event) => setScramblerInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        void handleScramblerTag();
                      }
                    }}
                    onBlur={() => {
                      requestAnimationFrame(() => {
                        if (!hasScrambler) {
                          scramblerInputRef.current?.focus();
                        }
                      });
                    }}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                  />
                </div>
              ) : (
                <div className="scramble-admin-registered-wrap">
                  <div className="scramble-admin-profile">
                    <div className="scramble-admin-profile-row">
                      <span>이름</span>
                      <strong>{scramblerCard?.name ?? "-"}</strong>
                    </div>
                    <div className="scramble-admin-profile-row">
                      <span>CCK ID</span>
                      <strong>{scramblerCard?.cckId ?? "-"}</strong>
                    </div>
                    <div className="scramble-admin-profile-row">
                      <span>UID</span>
                      <strong>{scramblerCard?.uid ?? "-"}</strong>
                    </div>
                  </div>

                  <button
                    className="scramble-admin-btn scramble-admin-btn--subtle"
                    type="button"
                    onClick={handleResetScrambler}
                  >
                    스크램블러 변경
                  </button>
                </div>
              )}
            </div>
          </section>

          <section className="scramble-admin-card scramble-admin-top-card scramble-admin-player-card">
            <h2 className="scramble-admin-title">선수</h2>

            <div className="scramble-admin-player-split">
              {hasScrambler ? (
                <div
                  className="scramble-admin-tag-wait scramble-admin-tag-wait--player scramble-admin-tag-wait--active"
                  onClick={() => {
                    playerInputRef.current?.focus();
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      playerInputRef.current?.focus();
                    }
                  }}
                >
                  <img className="scramble-admin-tag-wait-icon" src="/icon/sidebar/card.svg" alt="" aria-hidden="true" />
                  <span className="scramble-admin-tag-wait-text">선수 카드를 태그하세요</span>
                  <input
                    ref={playerInputRef}
                    className="scramble-admin-hidden-input"
                    type="text"
                    value={playerInput}
                    onChange={(event) => setPlayerInput(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        if (!loading) {
                          void handlePlayerTag();
                        }
                      }
                    }}
                    onBlur={() => {
                      requestAnimationFrame(() => {
                        if (hasScrambler) {
                          playerInputRef.current?.focus();
                        }
                      });
                    }}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                  />
                </div>
              ) : (
                <div className="scramble-admin-empty scramble-admin-empty--split">스크램블러를 먼저 등록해주세요</div>
              )}

              <div className="scramble-admin-player scramble-admin-player--compact">
                <div className="scramble-admin-player-row">
                  <span>선수명</span>
                  <strong>{result?.name ?? playerCard?.name ?? "-"}</strong>
                </div>
                <div className="scramble-admin-player-row">
                  <span>CCK ID</span>
                  <strong>{result?.cckId ?? playerCard?.cckId ?? "-"}</strong>
                </div>
                <div className="scramble-admin-player-row">
                  <span>라운드</span>
                  <strong>{result ? `${result.eventName} ${result.roundName}` : "-"}</strong>
                </div>
                <div className="scramble-admin-player-row">
                  <span>그룹</span>
                  <strong>{result?.roundGroup ?? "-"}</strong>
                </div>
                <div className="scramble-admin-player-row">
                  <span>회차</span>
                  <strong>{result?.seq ?? "-"}</strong>
                </div>
              </div>
            </div>
          </section>
        </div>

        <section className="scramble-admin-card scramble-admin-bottom-card">
          <h2 className="scramble-admin-title">스크램블</h2>

          {result?.svg ? (
            <div className="scramble-admin-svg" dangerouslySetInnerHTML={{ __html: result.svg }} />
          ) : (
            <div className="scramble-admin-empty">스크램블 이미지가 없습니다.</div>
          )}

          <pre className="scramble-admin-text">{result?.scramble ?? "-"}</pre>
        </section>
      </section>
    </div>
  );
};
