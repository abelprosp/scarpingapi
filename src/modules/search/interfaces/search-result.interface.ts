export interface WebResult {
  title: string;
  url: string;
  domain: string;
  description: string;
  favicon?: string;
  position: number;
  date?: string;
  breadcrumbs?: string[];
  richSnippet?: Record<string, unknown>;
  sitelinks?: Array<{ title: string; url: string }>;
  cache?: string;
  language?: string;
}

export interface NewsResult {
  title: string;
  source: string;
  date: string;
  thumbnail?: string;
  snippet: string;
  url: string;
  author?: string;
  category?: string;
}

export interface ImageResult {
  imageUrl: string;
  thumbnailUrl: string;
  title: string;
  source: string;
  domain: string;
  originalUrl: string;
  width?: number;
  height?: number;
  size?: string;
}

export interface VideoResult {
  title: string;
  duration: string;
  thumbnail: string;
  channel: string;
  views?: string;
  date?: string;
  description?: string;
  url: string;
}

export interface ShoppingResult {
  title: string;
  price: string;
  originalPrice?: string;
  discount?: string;
  store: string;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
  image?: string;
  url: string;
}

export interface MapsResult {
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  phone?: string;
  website?: string;
  hours?: string;
  rating?: number;
  reviewCount?: number;
  category?: string;
  photos?: string[];
}

export interface KnowledgeGraphResult {
  title: string;
  description?: string;
  image?: string;
  attributes?: Record<string, string>;
  website?: string;
  socialProfiles?: Record<string, string>;
  categories?: string[];
  relatedEntities?: Array<{ title: string; type: string }>;
}

export interface SearchResponse<T = unknown> {
  searchParameters: {
    q: string;
    gl: string;
    hl: string;
    type: string;
    engine: string;
    page: number;
    num: number;
  };
  organic?: T[];
  news?: NewsResult[];
  images?: ImageResult[];
  videos?: VideoResult[];
  shopping?: ShoppingResult[];
  places?: MapsResult[];
  knowledgeGraph?: KnowledgeGraphResult;
  relatedSearches?: string[];
  autocomplete?: string[];
  credits: number;
  cached: boolean;
  responseTime: number;
}

export interface BatchSearchResponse {
  results: Array<{
    index: number;
    type: string;
    query: string;
    success: boolean;
    data?: SearchResponse;
    error?: string;
  }>;
  totalCredits: number;
  responseTime: number;
}
