export const formatTimeValue = (value?: number) => {
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

export const formatTimeInput = (value?: number) => {
  if (value === null || value === undefined) {
    return "";
  }
  return formatTimeValue(value);
};

const formatDigitsToTime = (digits: string) => {
  const cleanDigits = digits.replace(/^0+(?=\d)/, "");
  let minutes = 0;
  let seconds = 0;
  let centis = 0;

  if (cleanDigits.length <= 2) {
    centis = Number(cleanDigits.padStart(2, "0"));
  } else if (cleanDigits.length <= 4) {
    centis = Number(cleanDigits.slice(-2));
    seconds = Number(cleanDigits.slice(0, -2));
  } else {
    centis = Number(cleanDigits.slice(-2));
    seconds = Number(cleanDigits.slice(-4, -2));
    minutes = Number(cleanDigits.slice(0, -4));
  }

  const totalHundredths = (minutes * 60 + seconds) * 100 + centis;
  const totalSeconds = Math.floor(totalHundredths / 100);
  const normalizedCentis = totalHundredths % 100;
  const normalizedMinutes = Math.floor(totalSeconds / 60);
  const normalizedSeconds = totalSeconds % 60;

  if (normalizedMinutes > 0) {
    return `${normalizedMinutes}:${String(normalizedSeconds).padStart(2, "0")}.${String(normalizedCentis).padStart(2, "0")}`;
  }
  return `${normalizedSeconds}.${String(normalizedCentis).padStart(2, "0")}`;
};

export const normalizeAttemptInput = (raw: string) => {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  if (trimmed === "-" || trimmed === "-1" || trimmed === "-2") {
    return trimmed;
  }
  const upper = trimmed.toUpperCase();
  if (/^[A-Z]+$/.test(upper)) {
    if ("DNF".startsWith(upper) || "DNS".startsWith(upper)) {
      return upper;
    }
    return upper;
  }
  const digits = trimmed.replace(/\D/g, "");
  if (!digits) return "";
  return formatDigitsToTime(digits);
};

export const parseTimeInput = (raw: string): number | undefined | null => {
  const trimmed = raw.trim();
  if (!trimmed) return undefined;
  const upper = trimmed.toUpperCase();
  if (upper === "DNF") return -1;
  if (upper === "DNS") return -2;
  if (trimmed === "-1") return -1;
  if (trimmed === "-2") return -2;
  const minuteMatch = trimmed.match(/^(\d+):(\d{1,2}(?:\.\d+)?)$/);
  if (minuteMatch) {
    const minutes = Number(minuteMatch[1]);
    const seconds = Number(minuteMatch[2]);
    if (Number.isNaN(minutes) || Number.isNaN(seconds)) return null;
    return minutes * 60 + seconds;
  }
  if (/^\d+(?:\.\d+)?$/.test(trimmed)) {
    return Number(trimmed);
  }
  return null;
};
