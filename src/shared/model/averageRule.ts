type AttemptLike = {
  attemptTry: number;
  time: number | null | undefined;
  extra?: number | null;
};

export const normalizeAvgCalc = (avgCalc?: string | null)  => (avgCalc ?? "").trim().toLowerCase();
const normalizeEventName = (eventName?: string | null) => (eventName ?? "").trim().toLowerCase();

export const isAo12AvgCalc = (avgCalc?: string | null) => normalizeAvgCalc(avgCalc) === "ao12";
export const isSingleAvgCalc = (avgCalc?: string | null) => normalizeAvgCalc(avgCalc) === "single";
export const isBo3AvgCalc = (avgCalc?: string | null) => normalizeAvgCalc(avgCalc) === "bo3";
export const isBA5Format = (avgCalc?: string | null, eventName?: string | null) => {
  const avg = normalizeAvgCalc(avgCalc);
  const event = normalizeEventName(eventName);
  return avg.includes("ba5") || event.includes("ba5");
};

export const getRequiredAttemptCount = (avgCalc?: string | null) => {
  const normalized = normalizeAvgCalc(avgCalc);
  if (normalized === "ao12") return 12;
  if (normalized === "mo3") return 3;
  if (normalized === "bo3") return 3;
  if (normalized === "single") return 1;
  return 5;
};

const isMainAttempt = (attempt: AttemptLike) => attempt.extra === undefined || attempt.extra === null;

export const getMainAttempts = <T extends AttemptLike>(attempts: T[], avgCalc?: string | null) => {
  const requiredCount = getRequiredAttemptCount(avgCalc);
  const sorted = [...attempts].sort((a, b) => a.attemptTry - b.attemptTry);
  const result: Array<{ attemptTry: number; time: number | null | undefined }> = [];

  for (let attemptTry = 1; attemptTry <= requiredCount; attemptTry += 1) {
    const main = sorted.find((attempt) => attempt.attemptTry === attemptTry && isMainAttempt(attempt));
    const fallback = sorted.find((attempt) => attempt.attemptTry === attemptTry);
    const target = main ?? fallback;
    result.push({ attemptTry, time: target?.time });
  }

  return result;
};

const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

const calculateTrimmedAverage = (values: number[]) => {
  if (values.length < 3) return null;

  const negativeCount = values.filter((value) => value < 0).length;
  if (negativeCount >= 2) return null;

  const indexed = values.map((value, index) => ({
    index,
    score: value < 0 ? Number.POSITIVE_INFINITY : value,
  }));
  indexed.sort((a, b) => a.score - b.score);

  const removeIndexSet = new Set<number>([indexed[0].index, indexed[indexed.length - 1].index]);
  const remained = values.filter((_, index) => !removeIndexSet.has(index));
  if (remained.some((value) => value < 0)) return null;

  return mean(remained);
};

const calculateMeanOf3 = (values: number[]) => {
  if (values.length !== 3) return null;
  if (values.some((value) => value < 0)) return null;
  return mean(values);
};

export const calculateAverageByRule = <T extends AttemptLike>(attempts: T[], avgCalc?: string | null) => {
  const normalized = normalizeAvgCalc(avgCalc);
  const mainAttempts = getMainAttempts(attempts, avgCalc);
  const values = mainAttempts.map((attempt) => attempt.time);

  if (values.some((value) => typeof value !== "number")) {
    return null;
  }
  const numericValues = values as number[];

  if (normalized === "ao12" || normalized === "ao5") {
    return calculateTrimmedAverage(numericValues);
  }
  if (normalized === "mo3") {
    return calculateMeanOf3(numericValues);
  }
  return null;
};

export const resolveAverageValue = <T extends AttemptLike>(
  attempts: T[],
  avgCalc: string | null | undefined,
  fallback?: number | null
) => {
  const computed = calculateAverageByRule(attempts, avgCalc);
  if (typeof computed === "number") {
    return computed;
  }
  return fallback ?? null;
};

export const getWorstAttemptTrySet = <T extends AttemptLike>(
  attempts: T[],
  avgCalc?: string | null,
  eventName?: string | null
) => {
  const candidates = getMainAttempts(attempts, avgCalc)
    .filter((attempt): attempt is { attemptTry: number; time: number } => typeof attempt.time === "number")
    .map((attempt) => ({
      attemptTry: attempt.attemptTry,
      score: attempt.time < 0 ? Number.POSITIVE_INFINITY : attempt.time,
    }))
    .sort((a, b) => {
      if (a.score !== b.score) return b.score - a.score;
      return b.attemptTry - a.attemptTry;
    });

  const worstCount = isBA5Format(avgCalc, eventName) ? 2 : 1;
  return new Set(candidates.slice(0, worstCount).map((item) => item.attemptTry));
};
