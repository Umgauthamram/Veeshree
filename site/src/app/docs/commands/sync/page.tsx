import { CommandDetail } from "@/components/command-detail";
import { commandsData } from "@/data/commands-data";

export default function SyncPage() {
  const doc = commandsData.find((c) => c.id === "sync")!;
  return <CommandDetail doc={doc} />;
}
