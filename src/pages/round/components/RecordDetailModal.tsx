import type { Record } from "@/entities/record";
import { createPortal } from "react-dom";
import { useEffect, useRef, useState } from "react";

type RecordDetailModalProps = {
  selected: { record: Record; rank: number } | null;
  onClose: () => void;
  formatTimeValue: (value?: number | null) => string;
  getAttemptValue: (attempts: Record["attempts"], attemptTry: number) => string;
};

export const RecordDetailModal = ({
  selected,
  onClose,
  formatTimeValue,
  getAttemptValue,
}: RecordDetailModalProps) => {
  const modalCardRef = useRef<HTMLDivElement | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const attemptMeasureRef = useRef<HTMLDivElement | null>(null);
  const [useSplitAttempts, setUseSplitAttempts] = useState(false);

  const inlineComputedStyles = (source: HTMLElement, target: HTMLElement) => {
    const computedStyle = window.getComputedStyle(source);
    for (let index = 0; index < computedStyle.length; index += 1) {
      const propertyName = computedStyle[index];
      target.style.setProperty(
        propertyName,
        computedStyle.getPropertyValue(propertyName),
        computedStyle.getPropertyPriority(propertyName),
      );
    }
  };

  const createCardImageBlob = async () => {
    const cardNode = modalCardRef.current;
    if (!cardNode) throw new Error("card-node-not-found");

    const cloneRoot = cardNode.cloneNode(true) as HTMLElement;
    cloneRoot.querySelectorAll("[data-export-hidden='true']").forEach((node) => node.remove());

    const sourceElements = [cardNode, ...Array.from(cardNode.querySelectorAll<HTMLElement>("*"))];
    const targetElements = [cloneRoot, ...Array.from(cloneRoot.querySelectorAll<HTMLElement>("*"))];
    sourceElements.forEach((sourceElement, index) => {
      const targetElement = targetElements[index];
      if (!targetElement) return;
      inlineComputedStyles(sourceElement, targetElement);
    });

    cloneRoot.querySelectorAll("img").forEach((imageNode) => {
      const src = imageNode.getAttribute("src");
      if (!src) return;
      imageNode.setAttribute("src", new URL(src, window.location.href).href);
      imageNode.setAttribute("crossorigin", "anonymous");
    });

    cloneRoot.style.maxHeight = "none";
    cloneRoot.style.width = `${cardNode.offsetWidth}px`;
    cloneRoot.style.height = `${cardNode.offsetHeight}px`;

    const serializer = new XMLSerializer();
    const markup = serializer.serializeToString(cloneRoot);
    const width = cardNode.offsetWidth;
    const height = cardNode.offsetHeight;
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <foreignObject width="100%" height="100%">${markup}</foreignObject>
      </svg>
    `;
    const svgBlob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const svgUrl = URL.createObjectURL(svgBlob);

    try {
      const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const nextImage = new Image();
        nextImage.onload = () => resolve(nextImage);
        nextImage.onerror = () => reject(new Error("svg-load-failed"));
        nextImage.src = svgUrl;
      });

      const scale = Math.max(window.devicePixelRatio || 1, 2);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(width * scale);
      canvas.height = Math.round(height * scale);
      const context = canvas.getContext("2d");
      if (!context) throw new Error("canvas-context-unavailable");
      context.setTransform(scale, 0, 0, scale, 0, 0);
      context.drawImage(image, 0, 0, width, height);

      const pngBlob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("png-export-failed"));
            return;
          }
          resolve(blob);
        }, "image/png");
      });
      return pngBlob;
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
  };

  const downloadImage = (blob: Blob) => {
    if (!selected) return;
    const sanitizedName = selected.record.name.replace(/\s+/g, "-").toLowerCase();
    const filename = `cck-record-${selected.rank}-${sanitizedName || "player"}.png`;
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(blobUrl);
  };

  const handleShare = async () => {
    if (!selected) return;
    if (isSharing) return;

    setIsSharing(true);
    let imageBlob: Blob | null = null;
    try {
      imageBlob = await createCardImageBlob();
      const sanitizedName = selected.record.name.replace(/\s+/g, "-").toLowerCase();
      const filename = `cck-record-${selected.rank}-${sanitizedName || "player"}.png`;
      const shareFile = new File([imageBlob], filename, { type: "image/png" });
      const shareText = `${selected.record.compName} - ${selected.record.eventName} ${selected.record.roundName}`;
      const hasWebShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
      const canShareFiles =
        hasWebShare &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [shareFile] });

      if (canShareFiles) {
        try {
          await navigator.share({
            files: [shareFile],
            title: `${selected.record.name} 기록 카드`,
            text: shareText,
          });
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
        }
      }

      if (hasWebShare) {
        try {
          await navigator.share({
            title: `${selected.record.name} 기록 카드`,
            text: shareText,
            url: window.location.href,
          });
        } catch (error) {
          if (error instanceof DOMException && error.name === "AbortError") {
            return;
          }
        }
      }

      downloadImage(imageBlob);
    } catch {
      if (imageBlob) {
        downloadImage(imageBlob);
      } else {
        window.alert("공유를 지원하지 않는 환경입니다. HTTPS 모바일 브라우저에서 다시 시도해주세요.");
      }
    } finally {
      setIsSharing(false);
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

  if (!selected) return null;

  const getHighlightValues = (attempts: Record["attempts"]) => {
    const times = attempts
      .map((attempt) => attempt.time)
      .filter((time) => typeof time === "number");
    const positiveTimes = times.filter((time) => time >= 0);
    const negativeTimes = times.filter((time) => time < 0);
    const bestValue = positiveTimes.length > 0 ? Math.min(...positiveTimes) : undefined;
    const worstValue =
      negativeTimes.length > 0
        ? Math.min(...negativeTimes)
        : positiveTimes.length > 0
          ? Math.max(...positiveTimes)
          : undefined;
    return { bestValue, worstValue, negativeTimes };
  };

  const { bestValue, worstValue, negativeTimes } = getHighlightValues(selected.record.attempts);
  const attemptTries = [1, 2, 3, 4, 5] as const;

  const renderAttempt = (attemptTry: number, showSeparator: boolean) => {
    const attempt = selected.record.attempts.find((item) => item.attemptTry === attemptTry);
    const time = attempt?.time;
    let highlightClass = "";
    if (time !== undefined && time !== null) {
      if (negativeTimes.length > 0 && time < 0) {
        highlightClass = "attempt-worst";
      } else if (time === bestValue) {
        highlightClass = "attempt-best";
      } else if (time === worstValue) {
        highlightClass = "attempt-worst";
      }
    }

    return (
      <span
        key={attemptTry}
        className={["record-modal-attempt", highlightClass].filter(Boolean).join(" ")}
      >
        {getAttemptValue(selected.record.attempts, attemptTry)}
        {showSeparator ? <span className="record-modal-attempt-sep"></span> : null}
      </span>
    );
  };

  const modal = (
    <div className="record-modal-backdrop" onClick={onClose}>
      <div
        ref={modalCardRef}
        className="record-modal record-modal--detail"
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="record-modal-header">
          <div className="record-modal-title">
            #{selected.rank} {selected.record.name}
          </div>
          <div className="record-modal-actions">
            <button
              type="button"
              className="record-modal-action-btn"
              onClick={handleShare}
              aria-label="공유"
              disabled={isSharing}
              data-export-hidden="true"
            >
              <img src="/icon/modal/share.svg" alt="" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="record-modal-close"
              onClick={onClose}
              aria-label="닫기"
              data-export-hidden="true"
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
            <div className="record-modal-value">{selected.record.state ?? "-"}</div>
          </div>
          <div className="record-modal-row">
            <div className="record-modal-label">평균</div>
            <div className="record-modal-value record-modal-score">{formatTimeValue(selected.record.average)}</div>
          </div>
          <div className="record-modal-row">
            <div className="record-modal-label">최고</div>
            <div className="record-modal-value record-modal-score record-modal-highlight">
              {formatTimeValue(selected.record.single)}
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
                    {[1, 2, 3].map((attemptTry) => renderAttempt(attemptTry, true))}
                  </div>
                  <div className="record-modal-attempt-row">
                    {[4, 5].map((attemptTry, index) => renderAttempt(attemptTry, index === 0))}
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
                src={`/icon/events/${encodeURIComponent(selected.record.eventName || "Question")}.svg`}
                alt=""
                loading="lazy"
                onError={(event) => {
                  const target = event.currentTarget;
                  if (target.dataset.fallback === "true") {
                    target.style.display = "none";
                    return;
                  }
                  target.dataset.fallback = "true";
                  target.src = "/icon/events/Question.svg";
                }}
              />
            </div>
            <div className="record-modal-round-text">
              <div className="record-modal-round-title">
                {selected.record.eventName} {selected.record.roundName}
              </div>
              <div className="record-modal-round-subtitle">{selected.record.compName}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document === "undefined") {
    return modal;
  }

  return createPortal(modal, document.body);
};
