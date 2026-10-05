import { ArchitectureDetail } from "@/components/architecture-detail";
import { architectureTopics } from "@/data/architecture-data";

export default function DirectoryStructurePage() {
  const topic = architectureTopics.find((t) => t.slug === "directory-structure")!;
  return <ArchitectureDetail topic={topic} />;
}
