import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthProvider } from "@/components/providers/session-provider";
import { SidebarProvider } from "@/contexts/sidebar-context";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { AdminHeader } from "@/components/admin/admin-header";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <AuthProvider>
      <SidebarProvider>
        <div className="flex h-screen w-full bg-background selection:bg-terracotta/10">
          <div className="hidden lg:block h-full shrink-0">
            <AdminSidebar />
          </div>
          <div className="flex flex-1 flex-col overflow-hidden relative">
            <AdminHeader />
            <main className="flex-1 overflow-y-auto p-4 md:p-10 no-scrollbar relative">
              <div className="absolute inset-0 bg-[radial-gradient(#e8dcc8_1px,transparent_1px)] [background-size:40px_40px] opacity-[0.15] pointer-events-none"></div>
              <div className="w-full relative z-10">{children}</div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </AuthProvider>
  );
}
