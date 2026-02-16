"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { AdminSidebar } from "./admin-sidebar";

export function AdminHeader() {
  return (
    <header className="flex h-14 items-center border-b px-4 lg:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-60">
          <AdminSidebar />
        </SheetContent>
      </Sheet>
      <span className="ml-3 font-bold">Temanyoga Admin</span>
    </header>
  );
}
