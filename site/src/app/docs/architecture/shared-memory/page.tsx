import { ArchitectureDetail } from "@/components/architecture-detail";
import { architectureTopics } from "@/data/architecture-data";

export default function SharedMemoryPage() {
  const topic = architectureTopics.find((t) => t.slug === "shared-memory")!;
  return <ArchitectureDetail topic={topic} />;
}
