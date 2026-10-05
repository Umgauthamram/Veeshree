import { CommandDetail } from "@/components/command-detail";
import { commandsData } from "@/data/commands-data";

export default function ContextPage() {
  const doc = commandsData.find((c) => c.id === "context")!;
  return <CommandDetail doc={doc} />;
}
