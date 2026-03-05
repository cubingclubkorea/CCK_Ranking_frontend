import type { Record } from "@/entities/record";
import {
  getEventIconSrc,
  getMainAttempts,
  getNewRecordBadgeSrc,
  getWorstAttemptTrySet,
  getRegionLogoSrc,
  isBo3AvgCalc,
  isSingleAvgCalc,
  mapRegionName,
  resolveAverageValue,
} from "@/shared";
import html2canvas from "html2canvas";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

type RecordDetailModalProps = {
  selected: { record: Record; rank: number } | null;
  onClose: () => void;
  formatTimeValue: (value?: number | null) => string;
};

export const RecordDetailModal = ({
  selected,
  onClose,
  formatTimeValue,
}: RecordDetailModalProps) => {
  const navigate = useNavigate();
  const attemptMeasureRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const shareMenuRef = useRef<HTMLDivElement | null>(null);
  const shareButtonRef = useRef<HTMLButtonElement | null>(null);
  const [useSplitAttempts, setUseSplitAttempts] = useState(false);
  const [shareMenuOpen, setShareMenuOpen] = useState(false);
  const [shareMenuPosition, setShareMenuPosition] = useState<{ top: number; left: number } | null>(null);
  const [savingImage, setSavingImage] = useState(false);
  const SHARE_MENU_WIDTH = 172;

  const updateShareMenuPosition = () => {
    const rect = shareButtonRef.current?.getBoundingClientRect();
    if (!rect) return;
    const nextLeft = Math.min(
      Math.max(8, rect.right - SHARE_MENU_WIDTH),
      Math.max(8, window.innerWidth - SHARE_MENU_WIDTH - 8)
    );
    const nextTop = Math.min(
      rect.bottom + 6,
      Math.max(8, window.innerHeight - 8)
    );
    setShareMenuPosition({ top: nextTop, left: nextLeft });
  };

  const handleCopyLink = async () => {
    const url = window.location.href;

    const legacyCopy = (value: string) => {
      const textarea = document.createElement("textarea");
      textarea.value = value;
      textarea.setAttribute("readonly", "true");
      textarea.style.position = "fixed";
      textarea.style.top = "-1000px";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      textarea.setSelectionRange(0, textarea.value.length);
      const copied = document.execCommand("copy");
      document.body.removeChild(textarea);
      return copied;
    };

    try {
      await navigator.clipboard.writeText(url);
      window.alert("링크가 복사되었습니다.");
    } catch {
      try {
        const copied = legacyCopy(url);
        if (copied) {
          window.alert("링크가 복사되었습니다.");
          return;
        }
      } catch {
        // legacy copy 실패 시 prompt로 폴백
      }
      window.prompt("링크를 복사하세요.", url);
    }
  };

  const handleSystemShare = async () => {
    const url = window.location.href;
    if (typeof navigator.share !== "function") {
      window.alert("현재 브라우저에서는 시스템 공유를 지원하지 않습니다.");
      return;
    }

    try {
      await navigator.share({ url });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      window.alert("시스템 공유 창을 열지 못했습니다.");
    }
  };

  const handleSaveModalImage = async () => {
    const sourceModal = modalRef.current;
    if (!sourceModal || !selected) return;
    let captureRoot: HTMLDivElement | null = null;
    let eventIconDataUrl: string | null = null;
    const blobToDataUrl = (blob: Blob) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === "string") {
            resolve(reader.result);
            return;
          }
          reject(new Error("이미지 변환에 실패했습니다."));
        };
        reader.onerror = () => reject(reader.error ?? new Error("이미지 변환에 실패했습니다."));
        reader.readAsDataURL(blob);
      });
    const fetchAsDataUrl = async (src: string) => {
      const response = await fetch(src, { cache: "no-cache" });
      if (!response.ok) {
        throw new Error(`이미지 로딩 실패: ${response.status}`);
      }
      const blob = await response.blob();
      return blobToDataUrl(blob);
    };
    try {
      setSavingImage(true);
      setShareMenuOpen(false);

      const clone = sourceModal.cloneNode(true) as HTMLDivElement;
      clone.style.margin = "0";
      clone.style.maxHeight = "none";
      clone.style.overflow = "visible";
      const actions = clone.querySelector(".record-modal-actions");
      if (actions) {
        actions.remove();
      }
      const regionLogos = Array.from(clone.querySelectorAll(".region-logo")) as HTMLImageElement[];
      regionLogos.forEach((logo) => {
        logo.style.width = "auto";
        logo.style.height = "18px";
        logo.style.maxWidth = "28px";
        logo.style.objectFit = "contain";
        logo.style.objectPosition = "center";
      });
      const sourceEventIcon = sourceModal.querySelector(".record-modal-round-icon img") as HTMLImageElement | null;
      const resolvedEventIconSrc =
        sourceEventIcon?.currentSrc || sourceEventIcon?.src || getEventIconSrc(selected.record.eventName);
      const eventIconInClone = clone.querySelector(".record-modal-round-icon img") as HTMLImageElement | null;
      if (eventIconInClone) {
        eventIconInClone.style.width = "44px";
        eventIconInClone.style.height = "44px";
        eventIconInClone.style.objectFit = "contain";
        eventIconInClone.style.display = "block";
        eventIconInClone.loading = "eager";
        eventIconInClone.decoding = "sync";
        eventIconInClone.removeAttribute("srcset");
        eventIconInClone.src = resolvedEventIconSrc;
        try {
          eventIconDataUrl = await fetchAsDataUrl(resolvedEventIconSrc);
          eventIconInClone.src = eventIconDataUrl;
        } catch {
          try {
            eventIconDataUrl = await fetchAsDataUrl(
              `${import.meta.env.VITE_EVENT_ICON_BASE_URL}/Question.svg`
            );
            eventIconInClone.src = eventIconDataUrl;
          } catch {
            eventIconInClone.src = `${import.meta.env.VITE_EVENT_ICON_BASE_URL}/Question.svg`;
          }
        }
      }
      const watermark = document.createElement("img");
      watermark.src = "/logo/cck-logo.png";
      watermark.alt = "";
      watermark.setAttribute("aria-hidden", "true");
      watermark.style.position = "absolute";
      watermark.style.left = "50%";
      watermark.style.top = "50%";
      watermark.style.transform = "translate(-50%, -50%)";
      watermark.style.width = "64%";
      watermark.style.maxWidth = "280px";
      watermark.style.opacity = "0.045";
      watermark.style.pointerEvents = "none";
      watermark.style.zIndex = "0";
      clone.insertBefore(watermark, clone.firstChild);

      captureRoot = document.createElement("div");
      captureRoot.style.position = "fixed";
      captureRoot.style.left = "-10000px";
      captureRoot.style.top = "0";
      captureRoot.style.pointerEvents = "none";
      captureRoot.style.opacity = "1";
      captureRoot.style.zIndex = "-1";
      captureRoot.appendChild(clone);
      document.body.appendChild(captureRoot);
      const cloneImages = Array.from(clone.querySelectorAll("img")) as HTMLImageElement[];
      cloneImages.forEach((image) => {
        image.loading = "eager";
        image.decoding = "sync";
      });

      await new Promise<void>((resolve) => {
        if (watermark.complete) {
          resolve();
          return;
        }
        watermark.onload = () => resolve();
        watermark.onerror = () => resolve();
      });
      await Promise.all(
        cloneImages.map(
          (image) =>
            new Promise<void>((resolve) => {
              if (image.complete) {
                resolve();
                return;
              }
              image.onload = () => resolve();
              image.onerror = () => resolve();
            })
        )
      );
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      await new Promise((resolve) => window.requestAnimationFrame(() => resolve(null)));
      await new Promise((resolve) => window.requestAnimationFrame(() => resolve(null)));

      const targetScale = Math.min(4, Math.max(3, (window.devicePixelRatio || 1) * 2));

      const canvas = await html2canvas(clone, {
        backgroundColor: null,
        useCORS: true,
        scale: targetScale,
        imageTimeout: 0,
        logging: false,
      });
      if (eventIconDataUrl && eventIconInClone) {
        const cloneRect = clone.getBoundingClientRect();
        const iconRect = eventIconInClone.getBoundingClientRect();
        const drawX = (iconRect.left - cloneRect.left) * targetScale;
        const drawY = (iconRect.top - cloneRect.top) * targetScale;
        const drawW = iconRect.width * targetScale;
        const drawH = iconRect.height * targetScale;
        const iconImage = await new Promise<HTMLImageElement>((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error("종목 아이콘 로딩 실패"));
          image.src = eventIconDataUrl as string;
        });
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(iconImage, drawX, drawY, drawW, drawH);
        }
      }
      document.body.removeChild(captureRoot);
      captureRoot = null;

      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("이미지 저장에 실패했습니다."))), "image/png");
      });

      const sanitizeFileName = (value: string) => value.replace(/[\\/:*?"<>|]/g, " ").trim();
      const baseFileName = sanitizeFileName(
        `CCK Ranking Record - ${selected.record.name} - ${selected.record.compName} - ${selected.record.roundName}`
      );
      const fileName = `${baseFileName || `record-${selected.record.idx}`}.png`;
      const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      const imageFile = new File([pngBlob], fileName, { type: "image/png" });

      if (isMobile) {
        if (typeof navigator.share !== "function") {
          window.alert("이 기기에서는 갤러리 저장을 위한 시스템 공유를 지원하지 않습니다.");
          return;
        }
        try {
          await navigator.share({ files: [imageFile], title: fileName });
          window.alert("이미지가 저장되었습니다.");
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
          window.alert("갤러리 저장 창을 열지 못했습니다.");
          return;
        }
      }

      const downloadUrl = URL.createObjectURL(pngBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);
      window.alert("이미지가 저장되었습니다.");
    } catch (error) {
      console.error(error);
      window.alert("이미지 저장에 실패했습니다.");
    } finally {
      if (captureRoot && document.body.contains(captureRoot)) {
        document.body.removeChild(captureRoot);
      }
      setSavingImage(false);
    }
  };

  useEffect(() => {
    const node = attemptMeasureRef.current;
    if (!node) return;

    const checkOverflow = () => {
      const shouldSplit = node.scrollWidth > node.clientWidth + 1;
      setUseSplitAttempts(shouldSplit);
    };

    checkOverflow();

    const observer = new ResizeObserver(() => {
      checkOverflow();
    });
    observer.observe(node);
    window.addEventListener("resize", checkOverflow);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", checkOverflow);
    };
  }, [selected?.record.idx]);

  useEffect(() => {
    if (!shareMenuOpen) return;
    updateShareMenuPosition();
    const handlePointerDown = (event: MouseEvent) => {
      const target = event.target as Node;
      if (shareMenuRef.current?.contains(target) || shareButtonRef.current?.contains(target)) {
        return;
      }
      setShareMenuOpen(false);
    };
    const handleViewportChange = () => updateShareMenuPosition();
    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [shareMenuOpen]);

  useEffect(() => {
    setShareMenuOpen(false);
    setShareMenuPosition(null);
  }, [selected?.record.idx]);

  if (!selected) return null;

  const mainAttempts = getMainAttempts(selected.record.attempts, selected.record.avgCalc);
  const hideAverage = isSingleAvgCalc(selected.record.avgCalc) || isBo3AvgCalc(selected.record.avgCalc);

  const getHighlightValues = () => {
    const times = mainAttempts
      .map((attempt) => attempt.time)
      .filter((time) => typeof time === "number");
    const positiveTimes = times.filter((time) => time >= 0);
    const bestValue = positiveTimes.length > 0 ? Math.min(...positiveTimes) : undefined;
    const worstTrySet = getWorstAttemptTrySet(
      selected.record.attempts,
      selected.record.avgCalc,
      selected.record.eventName
    );
    return { bestValue, worstTrySet };
  };

  const { bestValue, worstTrySet } = getHighlightValues();
  const attemptTries = mainAttempts.map((attempt) => attempt.attemptTry);
  const displayAverage = resolveAverageValue(
    selected.record.attempts,
    selected.record.avgCalc,
    selected.record.average
  );
  const regionLabel = mapRegionName(selected.record.state) ?? selected.record.state ?? "-";
  const regionLogoSrc = getRegionLogoSrc(selected.record.state);
  const singleBestTypeBadgeSrc = getNewRecordBadgeSrc(selected.record.singleBestType);
  const averageBestTypeBadgeSrc = getNewRecordBadgeSrc(selected.record.averageBestType);

  const renderAttempt = (attemptTry: number, showSeparator: boolean) => {
    const attempt = mainAttempts.find((item) => item.attemptTry === attemptTry);
    const time = attempt?.time;
    let highlightClass = "";
    if (time !== undefined && time !== null) {
      if (time === bestValue) {
        highlightClass = "attempt-best";
      } else if (worstTrySet.has(attemptTry)) {
        highlightClass = "attempt-worst";
      }
    }

    return (
      <span
        key={attemptTry}
        className={["record-modal-attempt", highlightClass].filter(Boolean).join(" ")}
      >
        {formatTimeValue(time)}
        {showSeparator ? <span className="record-modal-attempt-sep"></span> : null}
      </span>
    );
  };

  const modal = (
    <div className="record-modal-backdrop" onClick={onClose}>
      <div
        className="record-modal record-modal--detail"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
        ref={modalRef}
      >
        <div className="record-modal-header">
          <div className="record-modal-title">
            #{selected.rank} {selected.record.name}
          </div>
          <div className="record-modal-actions">
            <button
              type="button"
              className="record-modal-profile-btn"
              onClick={() => navigate(`/profile/${encodeURIComponent(selected.record.cckId)}`)}
              aria-label="선수 프로필로 이동"
            >
              <img src="/icon/sidebar/person.svg" alt="" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="record-modal-profile-btn"
              onClick={() => {
                if (shareMenuOpen) {
                  setShareMenuOpen(false);
                  return;
                }
                updateShareMenuPosition();
                setShareMenuOpen(true);
              }}
              ref={shareButtonRef}
              aria-label="링크 공유"
              title="링크 공유"
              disabled={savingImage}
            >
              <img src="/icon/button/share.svg" alt="" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="record-modal-close"
              onClick={() => {
                setShareMenuOpen(false);
                onClose();
              }}
              aria-label="닫기"
            >
              <img src="/icon/modal/close.svg" alt="" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="record-modal-body">
          <div className="record-modal-row">
            <div className="record-modal-label">CCK ID</div>
            <div className="record-modal-value">{selected.record.cckId}</div>
          </div>
          <div className="record-modal-row">
            <div className="record-modal-label">지역</div>
            <div className="record-modal-value record-modal-region region-inline">
              {regionLogoSrc ? <img className="region-logo" src={regionLogoSrc} alt="" aria-hidden="true" /> : null}
              <span>{regionLabel}</span>
            </div>
          </div>
          {!hideAverage ? (
            <div className="record-modal-row">
              <div className="record-modal-label">평균</div>
              <div className="record-modal-value record-modal-score">
                <span className="record-value-with-badge record-value-with-badge--floating record-value-with-badge--modal">
                  <span className="record-value-with-badge-text">{formatTimeValue(displayAverage)}</span>
                  {averageBestTypeBadgeSrc ? (
                    <img
                      className={`new-record-badge${selected.record.averageBestType === "CCR" ? " new-record-badge--ccr" : ""}`}
                      src={averageBestTypeBadgeSrc}
                      alt={String(selected.record.averageBestType)}
                    />
                  ) : null}
                </span>
              </div>
            </div>
          ) : null}
          <div className="record-modal-row">
            <div className="record-modal-label">최고</div>
            <div className="record-modal-value record-modal-score record-modal-highlight">
              <span className="record-value-with-badge record-value-with-badge--floating record-value-with-badge--modal">
                <span className="record-value-with-badge-text">{formatTimeValue(selected.record.single)}</span>
                {singleBestTypeBadgeSrc ? (
                  <img
                    className={`new-record-badge${selected.record.singleBestType === "CCR" ? " new-record-badge--ccr" : ""}`}
                    src={singleBestTypeBadgeSrc}
                    alt={String(selected.record.singleBestType)}
                  />
                ) : null}
              </span>
            </div>
          </div>
          <div className="record-modal-row">
            <div className="record-modal-label">시도</div>
            <div className="record-modal-value record-modal-attempts-wrap">
              {!useSplitAttempts ? (
                <div className="record-modal-attempts record-modal-attempts--single">
                  {attemptTries.map((attemptTry, index) => renderAttempt(attemptTry, index < attemptTries.length - 1))}
                </div>
              ) : (
                <div className="record-modal-attempts record-modal-attempts--split">
                  <div className="record-modal-attempt-row">
                    {attemptTries
                      .slice(0, Math.ceil(attemptTries.length / 2))
                      .map((attemptTry, index, list) =>
                        renderAttempt(attemptTry, index < list.length - 1)
                      )}
                  </div>
                  <div className="record-modal-attempt-row">
                    {attemptTries
                      .slice(Math.ceil(attemptTries.length / 2))
                      .map((attemptTry, index, list) =>
                        renderAttempt(attemptTry, index < list.length - 1)
                      )}
                  </div>
                </div>
              )}
              <div
                ref={attemptMeasureRef}
                className="record-modal-attempts record-modal-attempts--single record-modal-attempts--measure"
                aria-hidden="true"
              >
                {attemptTries.map((attemptTry, index) => renderAttempt(attemptTry, index < attemptTries.length - 1))}
              </div>
            </div>
          </div>
          <div className="record-modal-divider" aria-hidden="true" />
          <div className="record-modal-round-info">
            <div className="record-modal-round-icon" aria-hidden="true">
              <img
                src={getEventIconSrc(selected.record.eventName)}
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
            </div>
            <div className="record-modal-round-text">
              <button
                type="button"
                className="record-modal-link-button record-modal-round-title"
                onClick={() => navigate(`/competition/${selected.record.compIdx}/round/${selected.record.roundIdx}`)}
              >
                {selected.record.eventName} {selected.record.roundName}
              </button>
              <button
                type="button"
                className="record-modal-link-button record-modal-round-subtitle"
                onClick={() => navigate(`/competition/${selected.record.compIdx}`)}
              >
                {selected.record.compName}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return modal;
  }

  return createPortal(
    <>
      {modal}
      {shareMenuOpen && shareMenuPosition ? (
        <div
          className="record-share-menu"
          ref={shareMenuRef}
          role="menu"
          aria-label="공유 옵션"
          style={{ top: `${shareMenuPosition.top}px`, left: `${shareMenuPosition.left}px`, width: `${SHARE_MENU_WIDTH}px` }}
        >
          <button
            type="button"
            className="record-share-menu-item"
            onClick={() => {
              void handleCopyLink();
              setShareMenuOpen(false);
            }}
          >
            기록 링크 복사
          </button>
          <button
            type="button"
            className="record-share-menu-item"
            onClick={() => {
              void handleSaveModalImage();
            }}
            disabled={savingImage}
          >
            {savingImage ? "이미지 저장 중..." : "이미지로 저장"}
          </button>
          <button
            type="button"
            className="record-share-menu-item"
            onClick={() => {
              void handleSystemShare();
              setShareMenuOpen(false);
            }}
          >
            기타
          </button>
        </div>
      ) : null}
    </>,
    document.body
  );
};
