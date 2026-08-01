import { SearchType } from '@prisma/client';

/** Custo em créditos por tipo de busca SERP */
export const SEARCH_CREDIT_COSTS: Partial<Record<SearchType, number>> = {
  [SearchType.WEB]: 2,
  [SearchType.IMAGES]: 3,
  [SearchType.NEWS]: 3,
  [SearchType.SHOPPING]: 4,
  [SearchType.VIDEOS]: 3,
  [SearchType.MAPS]: 5,
  [SearchType.PLACES]: 5,
  [SearchType.AUTOCOMPLETE]: 1,
  [SearchType.RELATED_SEARCHES]: 2,
  [SearchType.KNOWLEDGE_GRAPH]: 3,
  [SearchType.REVERSE_IMAGE]: 4,
};

export const DEFAULT_SEARCH_CREDIT_COST = 2;

export function getSearchCreditCost(type: SearchType): number {
  return SEARCH_CREDIT_COSTS[type] ?? DEFAULT_SEARCH_CREDIT_COST;
}

/** Custo em créditos das APIs avançadas */
export const ADVANCED_CREDIT_COSTS: Record<string, number> = {
  extract: 5,
  embeddings: 5,
  prepare: 5,
  'dataset-query': 5,
  screenshot: 8,
  pdf: 8,
  'rag-query': 8,
  browser: 10,
  crawl: 15,
  'ai-search': 15,
  agent: 15,
  'rag-index': 15,
  research: 25,
  'deep-research': 60,
  memory: 2,
};

export function getAdvancedCreditCost(operation: string, fallback = DEFAULT_SEARCH_CREDIT_COST): number {
  return ADVANCED_CREDIT_COSTS[operation] ?? fallback;
}
