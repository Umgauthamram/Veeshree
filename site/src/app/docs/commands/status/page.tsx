import { CommandDetail } from "@/components/command-detail";
import { commandsData } from "@/data/commands-data";

export default function StatusPage() {
  const doc = commandsData.find((c) => c.id === "status")!;
  return <CommandDetail doc={doc} />;
}
