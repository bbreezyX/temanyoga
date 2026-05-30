import { Footer } from "@/components/layout/footer";
import { CustomerShell } from "@/components/layout/customer-shell";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <CustomerShell>{children}</CustomerShell>
      <Footer />
    </div>
  );
}
