import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://veeshree.dev";
  const now = new Date();

  const routes = [
    "",
    "/docs",
    "/docs/the-problem",
    "/docs/installation",
    "/docs/quickstart",
    "/docs/saving-data",
    "/docs/saving-data/ambient-watcher",
    "/docs/saving-data/native-ide-rules",
    "/docs/saving-data/manual-cli-pipeline",
    "/docs/saving-data/comparison-matrix",
    "/docs/commands",
    "/docs/commands/init",
    "/docs/commands/doctor",
    "/docs/commands/watch",
    "/docs/commands/status",
    "/docs/commands/context",
    "/docs/commands/sync",
    "/docs/commands/capture",
    "/docs/commands/models",
    "/docs/commands/keys",
    "/docs/commands/search",
    "/docs/commands/decisions",
    "/docs/commands/gc",
    "/docs/architecture",
    "/docs/architecture/shared-memory",
    "/docs/architecture/directory-structure",
    "/docs/architecture/token-budget",
    "/docs/architecture/drift-guard",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: now,
    changeFrequency: route === "" || route.startsWith("/docs/architecture") ? "weekly" : "monthly",
    priority: route === "" ? 1.0 : route === "/docs" || route === "/docs/architecture/shared-memory" ? 0.9 : 0.8,
  }));
}
