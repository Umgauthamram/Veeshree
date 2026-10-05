import { ArchitectureDetail } from "@/components/architecture-detail";
import { architectureTopics } from "@/data/architecture-data";

export default function DriftGuardPage() {
  const topic = architectureTopics.find((t) => t.slug === "drift-guard")!;
  return <ArchitectureDetail topic={topic} />;
}
