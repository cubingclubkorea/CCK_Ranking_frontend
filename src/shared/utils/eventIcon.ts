export const getEventIconSrc = (eventName?: string | null) => {
  const safeName = (eventName ?? "Question").trim() || "Question";
  // macOS-origin asset names can be stored as NFD; normalize to avoid NFC/NFD mismatches.
  const normalized = safeName.normalize("NFD");
  return `/icon/events/${encodeURIComponent(normalized)}.svg`;
};
