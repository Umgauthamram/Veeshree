import { CommandDetail } from "@/components/command-detail";
import { commandsData } from "@/data/commands-data";

export default function InitPage() {
  const doc = commandsData.find((c) => c.id === "init")!;
  return <CommandDetail doc={doc} />;
}
