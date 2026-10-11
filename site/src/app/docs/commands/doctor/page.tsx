import { CommandDetail } from "@/components/command-detail";
import { commandsData } from "@/data/commands-data";

export default function DoctorPage() {
  const doc = commandsData.find((c) => c.id === "doctor")!;
  return <CommandDetail doc={doc} />;
}
