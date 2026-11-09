import CosmicDashboard from "@/components/cosmic-dashboard/CosmicDashboard";

export const metadata = {
  title: "Gyankunj Cosmic Dashboard Preview",
  description: "Public, read-only visual preview of the Gyankunj learning universe.",
};

export default function DashboardPreviewPage() {
  return <CosmicDashboard demo />;
}
