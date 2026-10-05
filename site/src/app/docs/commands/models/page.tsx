import { CommandDetail } from "@/components/command-detail";
import { commandsData } from "@/data/commands-data";

export default function ModelsPage() {
  const doc = commandsData.find((c) => c.id === "models")!;
  return <CommandDetail doc={doc} />;
}
