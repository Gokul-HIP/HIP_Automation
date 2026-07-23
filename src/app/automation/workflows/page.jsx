import { redirect } from "next/navigation";

export default function LegacyWorkflowsRedirect() {
  redirect("/workflows");
}
