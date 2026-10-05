import { CommandDetail } from "@/components/command-detail";
import { commandsData } from "@/data/commands-data";

export default function CapturePage() {
  const doc = commandsData.find((c) => c.id === "capture")!;
  return <CommandDetail doc={doc} />;
}
