import { CommandDetail } from "@/components/command-detail";
import { commandsData } from "@/data/commands-data";

export default function WatchPage() {
  const doc = commandsData.find((c) => c.id === "watch")!;
  return <CommandDetail doc={doc} />;
}
