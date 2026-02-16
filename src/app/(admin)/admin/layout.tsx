import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AuthProvider } from "@/components/providers/session-provider";
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
      <div className="flex h-screen">
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>
        <div className="flex flex-1 flex-col overflow-hidden">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </AuthProvider>
  );
}
