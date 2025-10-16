import { SidebarNav } from "@/components/sidebar-nav";
import { WorkspaceLayout } from "@/components/workspace-layout";
import { Roles } from "@/enums/user.enum";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <WorkspaceLayout  sidebar={<SidebarNav />}>{children}</WorkspaceLayout>;
}