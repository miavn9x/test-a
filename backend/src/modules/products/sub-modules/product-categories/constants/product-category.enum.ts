// --- [Loại danh mục sản phẩm] ---
export enum ProductCategoryType {
  ESIM = 'eSim',
  PHYSICAL = 'physical',
}

// --- [Danh sách châu lục] ---
export const CONTINENTS = {
  ASIA: { vi: 'Châu Á', en: 'Asia' },
  EUROPE: { vi: 'Châu Âu', en: 'Europe' },
  NORTH_AMERICA: { vi: 'Bắc Mỹ', en: 'North America' },
  SOUTH_AMERICA: { vi: 'Nam Mỹ', en: 'South America' },
  AFRICA: { vi: 'Châu Phi', en: 'Africa' },
  AUSTRALIA: { vi: 'Châu Úc', en: 'Australia' },
  ANTARCTICA: { vi: 'Châu Nam Cực', en: 'Antarctica' },
} as const;

// --- [Kiểu khoá châu lục] ---
export type ContinentKey = keyof typeof CONTINENTS;
// --- [Kiểu giá trị châu lục] ---
export type ContinentValue = (typeof CONTINENTS)[ContinentKey];
