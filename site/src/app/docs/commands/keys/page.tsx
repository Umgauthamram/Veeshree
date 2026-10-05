import { CommandDetail } from "@/components/command-detail";
import { commandsData } from "@/data/commands-data";

export default function KeysPage() {
  const doc = commandsData.find((c) => c.id === "keys")!;
  return <CommandDetail doc={doc} />;
}
