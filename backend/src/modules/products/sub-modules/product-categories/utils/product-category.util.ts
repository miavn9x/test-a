// --- [Imports] ---
import slugify from 'slugify';
import { removeVietnameseTones } from 'src/common/utils/remove-vietnamese-tones.util';

// --- [Generate Display Name] ---
export function generateDisplayName(
  type: 'eSim' | 'physical',
  networkName: { vi: string; en: string }[],
): { vi: string; en: string } {
  const getDisplayType = (type: string) => (type === 'eSim' ? 'eSim' : 'Sim');

  return {
    vi: `${getDisplayType(type)} ${networkName.map(n => n.vi).join(', ')}`,
    en: `${getDisplayType(type)} ${networkName.map(n => n.en).join(', ')}`,
  };
}

// --- [Generate Code From Name] ---
export function generateCodeFromName(displayName: { vi: string; en: string }): string {
  const base = displayName.en || displayName.vi;
  const noAccent = removeVietnameseTones(base);
  const slug = slugify(noAccent, { lower: true, strict: true });

  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yy = String(now.getFullYear()).slice(-2);

  return `${slug}-${dd}${mm}${yy}`;
}

// --- [Build Sort Option] ---
export function buildSortOption(sortBy?: string): Record<string, 1 | -1> {
  if (sortBy === 'createdAtAsc') return { createdAt: 1 };
  if (sortBy === 'createdAtDesc') return { createdAt: -1 };
  return { createdAt: -1 };
}
