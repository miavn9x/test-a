// --- [Imports] ---
import { removeVietnameseTones } from 'src/common/utils/remove-vietnamese-tones.util';
import { slugify } from 'src/common/utils/slugify.util';

// --- [Utils sinh code] ---
export function generateProductCode(name: { vi: string; en: string }) {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = String(now.getFullYear()).slice(2);
  const dateSuffix = `${day}${month}${year}`;

  return slugify(name.en) + '-' + dateSuffix;
}

// --- [Utils sinh tokens] ---
export function generateProductTokens(name: { vi: string; en: string }) {
  return {
    vi: tokenize(name.vi),
    en: tokenize(name.en),
  };
}

// --- [Tokenize Helper] ---
function tokenize(input: string): string[] {
  const clean = removeVietnameseTones(input)
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(' ')
    .filter(Boolean);

  return clean;
}

// --- [Build Sort Option] ---
export function buildSortOption(sortBy?: string): Record<string, 1 | -1> {
  if (sortBy === 'createdAtAsc') return { createdAt: 1 };
  if (sortBy === 'createdAtDesc') return { createdAt: -1 };
  return { createdAt: -1 };
}
