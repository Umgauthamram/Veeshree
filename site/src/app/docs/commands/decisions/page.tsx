import { CommandDetail } from "@/components/command-detail";
import { commandsData } from "@/data/commands-data";

export default function DecisionsPage() {
  const doc = commandsData.find((c) => c.id === "decisions")!;
  return <CommandDetail doc={doc} />;
}
