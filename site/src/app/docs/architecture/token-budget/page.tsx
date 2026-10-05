import { ArchitectureDetail } from "@/components/architecture-detail";
import { architectureTopics } from "@/data/architecture-data";

export default function TokenBudgetPage() {
  const topic = architectureTopics.find((t) => t.slug === "token-budget")!;
  return <ArchitectureDetail topic={topic} />;
}
