import axios from "axios";
import { useQuery } from "@tanstack/vue-query";

// * Devicon nyediain katalog + CDN buat 500+ logo bahasa/framework/tools/database dalam
const DEVICON_DATA_URL = "https://cdn.jsdelivr.net/gh/devicons/devicon/devicon.json";
const DEVICON_ICON_BASE = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";

// * Urutan varian yang lebih disukai pas milih 1 ikon representatif per entry -
const PREFERRED_VARIANTS = ["original", "plain", "line"];

interface DeviconRawEntry {
  name: string;
  altnames: string[];
  versions: { svg: string[] };
}

export interface TechIconOption {
  slug: string;
  label: string;
  iconUrl: string;
  altnames: string[];
}

function pickVariant(versions: string[]): string | null {
  if (!versions.length) return null;
  const preferred = PREFERRED_VARIANTS.find((variant) => versions.includes(variant));
  return preferred ?? versions[0] ?? null;
}

async function fetchTechIconCatalog(): Promise<TechIconOption[]> {
  // * Sengaja pakai axios polos (bukan axiosClient di @/api/axiosClient) - axiosClient itu
  const { data } = await axios.get<DeviconRawEntry[]>(DEVICON_DATA_URL);

  return data.flatMap((entry) => {
    const variant = pickVariant(entry.versions?.svg ?? []);
    if (!variant) return [];

    return [
      {
        slug: entry.name,
        label: entry.name.charAt(0).toUpperCase() + entry.name.slice(1),
        iconUrl: `${DEVICON_ICON_BASE}/${entry.name}/${entry.name}-${variant}.svg`,
        altnames: entry.altnames ?? [],
      },
    ];
  });
}

export const techIconKeys = {
  all: ["techIcons"] as const,
  catalog: () => [...techIconKeys.all, "catalog"] as const,
};

// * Katalog devicon statis & jarang berubah - staleTime & gcTime sengaja dibikin panjang
export const useTechIconsQuery = () => {
  return useQuery({
    queryKey: techIconKeys.catalog(),
    queryFn: fetchTechIconCatalog,
    staleTime: 60 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });
};

// * Dipisah dari query-nya sendiri biar gampang dipanggil ulang tiap kali search query atau
export function searchTechIcons(
  catalog: TechIconOption[] | undefined,
  query: string,
  excludeSlugs: Set<string> = new Set(),
  limit = 8,
): TechIconOption[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized || !catalog) return [];

  return catalog
    .filter((entry) => !excludeSlugs.has(entry.slug))
    .filter(
      (entry) =>
        entry.label.toLowerCase().includes(normalized) ||
        entry.slug.toLowerCase().includes(normalized) ||
        entry.altnames.some((altname) => altname.toLowerCase().includes(normalized)),
    )
    .slice(0, limit);
}
