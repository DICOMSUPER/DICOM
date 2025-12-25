import { SidebarNav } from "@/components/sidebar-nav";
import { WorkspaceLayout } from "@/components/workspace-layout";

interface RadiologistLayoutProps {
  children: React.ReactNode;
  topToolbar?: React.ReactNode;
  noPadding?: boolean;
  noBreadcrumbs?: boolean;
}

export function RadiologistWorkspaceLayout({
  children,
  topToolbar,
  noPadding = false,
  noBreadcrumbs = false,
}: RadiologistLayoutProps) {
  return (
    <WorkspaceLayout
      sidebar={<SidebarNav />}
      topToolbar={topToolbar}
      noPadding={noPadding}
      noBreadcrumbs={noBreadcrumbs}
      subtitle="Radiologist Workspace"
    >
      {children}
    </WorkspaceLayout>
  );
}
