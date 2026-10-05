import { CommandDetail } from "@/components/command-detail";
import { commandsData } from "@/data/commands-data";

export default function SearchPage() {
  const doc = commandsData.find((c) => c.id === "search")!;
  return <CommandDetail doc={doc} />;
}
