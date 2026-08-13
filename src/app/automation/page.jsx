import { redirect } from "next/navigation";

export default function LegacyAutomationRedirect() {
  redirect("/workflows/new");
}
