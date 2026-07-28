import { SearchType } from '@prisma/client';

export interface SearchUrlOptions {
  lat?: number;
  lng?: number;
  radius?: number;
  placeType?: string;
  imageSize?: string;
  imageType?: string;
  newsTbs?: string;
}

const PLACE_TYPE_QUERY: Record<string, string> = {
  restaurant: 'restaurante',
  hotel: 'hotel',
  business: 'empresa',
  store: 'loja',
};

export function buildSearchUrl(
  type: SearchType,
  q: string,
  gl: string,
  hl: string,
  page: number,
  num: number,
  options: SearchUrlOptions = {},
): string {
  const lang = hl.includes('-') ? hl : `${hl}-${gl.toUpperCase()}`;

  switch (type) {
    case SearchType.MAPS:
    case SearchType.PLACES:
      return buildGoogleMapsUrl(q, gl, lang, options);

    case SearchType.IMAGES:
      return buildGoogleSearchUrl(q, gl, hl, page, num, {
        tbm: 'isch',
        extra: {
          ...(options.imageSize ? { imgsz: options.imageSize } : {}),
          ...(options.imageType ? { imgtype: options.imageType } : {}),
        },
      });

    case SearchType.NEWS:
      return buildGoogleSearchUrl(q, gl, hl, page, num, {
        tbm: 'nws',
        extra: options.newsTbs ? { tbs: `qdr:${options.newsTbs}` } : {},
      });

    case SearchType.SHOPPING:
      return buildGoogleSearchUrl(q, gl, hl, page, num, { tbm: 'shop' });

    case SearchType.VIDEOS:
      return buildGoogleSearchUrl(q, gl, hl, page, num, { tbm: 'vid' });

    case SearchType.KNOWLEDGE_GRAPH:
    case SearchType.RELATED_SEARCHES:
    case SearchType.WEB:
    default:
      return buildGoogleSearchUrl(q, gl, hl, page, num, {});
  }
}

function buildGoogleMapsUrl(
  q: string,
  gl: string,
  lang: string,
  options: SearchUrlOptions,
): string {
  let query = q;
  if (options.placeType && PLACE_TYPE_QUERY[options.placeType]) {
    query = `${PLACE_TYPE_QUERY[options.placeType]} ${q}`;
  }

  const encoded = encodeURIComponent(query);
  let url = `https://www.google.com/maps/search/${encoded}`;

  if (options.lat != null && options.lng != null) {
    const zoom = radiusToZoom(options.radius ?? 5000);
    url += `/@${options.lat},${options.lng},${zoom}z`;
  }

  const params = new URLSearchParams({
    hl: lang,
    gl: gl.toUpperCase(),
    entry: 'ttu',
  });

  return `${url}?${params.toString()}`;
}

function buildGoogleSearchUrl(
  q: string,
  gl: string,
  hl: string,
  page: number,
  num: number,
  opts: { tbm?: string; extra?: Record<string, string> },
): string {
  const params = new URLSearchParams({
    q,
    gl,
    hl,
    num: String(num),
    start: String((page - 1) * num),
  });

  if (opts.tbm) params.set('tbm', opts.tbm);
  for (const [key, value] of Object.entries(opts.extra ?? {})) {
    params.set(key, value);
  }

  return `https://www.google.com/search?${params.toString()}`;
}

function radiusToZoom(radiusMeters: number): number {
  if (radiusMeters <= 500) return 16;
  if (radiusMeters <= 1000) return 15;
  if (radiusMeters <= 3000) return 14;
  if (radiusMeters <= 8000) return 13;
  if (radiusMeters <= 20000) return 12;
  return 11;
}

export function supportsDuckDuckGoFallback(type: SearchType): boolean {
  return type === SearchType.WEB;
}

export function supportsDuckDuckGoImagesFallback(type: SearchType): boolean {
  return type === SearchType.IMAGES;
}

export function supportsNominatimFallback(type: SearchType): boolean {
  return type === SearchType.MAPS || type === SearchType.PLACES;
}
