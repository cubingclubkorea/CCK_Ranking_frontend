const REGION_LABELS: Record<string, string> = {
  Seoul: "서울특별시",
  Busan: "부산광역시",
  Daegu: "대구광역시",
  Incheon: "인천광역시",
  Gwangju: "광주광역시",
  Daejeon: "대전광역시",
  Ulsan: "울산광역시",
  "Gyeonggi-South": "경기 남부",
  "Gyeonggi-North": "경기 북부",
  Jeonnam: "전라남도",
  Jeonbuk: "전라북도",
  Gangwon: "강원도",
  Chungnam: "충청남도",
  Chungbuk: "충청북도",
  Gyeongbuk: "경상북도",
  Gyeongnam: "경상남도",
  Geyongbuk: "경상북도",
  Sejong: "세종특별자치시",
  Jeju: "제주특별자치도",
};

const REGION_KEYS_BY_LABEL = Object.entries(REGION_LABELS).reduce<Record<string, string>>((acc, [key, label]) => {
  if (!acc[label]) {
    acc[label] = key;
  }
  return acc;
}, {});

export const REGION_FILTER_OPTIONS = Array.from(
  new Set(Object.values(REGION_LABELS))
);

export const mapRegionName = (value?: string | null) =>
  value ? (REGION_LABELS[value] ?? value) : value;

export const resolveRegionKey = (value?: string | null) => {
  if (!value) return undefined;
  if (REGION_LABELS[value]) return value;
  return REGION_KEYS_BY_LABEL[value];
};

export const mapRegionKeyToLabel = (value?: string | null) =>
  value ? (REGION_LABELS[value] ?? undefined) : undefined;

export const getRegionLogoSrc = (value?: string | null) => {
  const key = resolveRegionKey(value);
  return key ? `/logo/state-logo/${key}.svg` : undefined;
};
