import { CommandDetail } from "@/components/command-detail";
import { commandsData } from "@/data/commands-data";

export default function GcPage() {
  const doc = commandsData.find((c) => c.id === "gc")!;
  return <CommandDetail doc={doc} />;
}
