import { Metadata } from "next";
import DashboardClient from "@/components/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your uploaded PDFs and start chatting.",
};

export default function DashboardPage() {
  return <DashboardClient />;
}
