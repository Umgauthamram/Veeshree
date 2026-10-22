import { loadOrBuildIndex, createSearchEngine } from "./indexer.js";

export interface SearchResultItem {
  id: string;
  title: string;
  path: string;
  type: string;
  status: string;
  tags: string[];
  snippet: string;
  score: number;
}

export function searchMemory(
  query: string,
  options: { includeArchived?: boolean } = {},
  rootDir: string = process.cwd()
): SearchResultItem[] {
  if (!query.trim()) return [];

  const indexData = loadOrBuildIndex(rootDir);
  let docs = indexData.documents;

  if (!options.includeArchived) {
    // Filter out archived decisions and completed tasks
    docs = docs.filter((d) => d.type !== "archived_decision" && !d.path.includes("archive"));
  }

  if (docs.length === 0) return [];

  const searchEngine = createSearchEngine(docs);
  const rawResults = searchEngine.search(query);

  return rawResults.map((res) => {
    const doc = docs.find((d) => d.id === res.id)!;
    // Generate simple context snippet
    let snippet = doc.content.slice(0, 160).replace(/\n+/g, " ");
    if (doc.content.length > 160) snippet += "...";

    return {
      id: doc.id,
      title: doc.title,
      path: doc.path,
      type: doc.type,
      status: doc.status,
      tags: doc.tags,
      snippet,
      score: Math.round(res.score * 100) / 100,
    };
  });
}
