"use client";

import { useState } from "react";
import { User, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { UserSettings } from "@/components/admin/settings/user-settings";
import { UserList } from "@/components/admin/settings/user-list";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "profile", label: "Profil Saya", icon: User },
  { id: "users", label: "Semua Pengguna", icon: Users },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState<TabId>("profile");
  const [refreshKey, setRefreshKey] = useState(0);

  const currentUserId = session?.user?.id || "";

  function handleRefresh() {
    setRefreshKey((k) => k + 1);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col gap-1 animate-fade-in-up">
        <h1 className="font-display text-3xl font-extrabold text-dark-brown tracking-tight">
          Pengguna
        </h1>
        <p className="text-warm-gray font-medium text-sm">
          Kelola akun admin dan pengguna Anda.
        </p>
      </div>

      <div className="flex items-center justify-center gap-1 p-1 bg-cream/50 ring-1 ring-warm-sand/30 rounded-2xl overflow-x-auto no-scrollbar animate-fade-in-up">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap shrink-0",
              activeTab === tab.id
                ? "bg-white text-terracotta shadow-sm ring-1 ring-warm-sand/20"
                : "text-warm-gray hover:text-dark-brown hover:bg-white/50"
            )}
          >
            <tab.icon className={cn("h-4 w-4", activeTab === tab.id ? "text-terracotta" : "text-warm-gray")} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="relative min-h-[500px]">
        {activeTab === "profile" && (
          <div className="animate-fade-in-up">
            <section className="rounded-[32px] bg-white p-6 sm:p-8 shadow-soft ring-1 ring-warm-sand/30">
              <div className="mb-8">
                <h2 className="font-display text-xl font-extrabold text-dark-brown flex items-center gap-2">
                  <User className="h-5 w-5 text-terracotta" />
                  Profil Saya
                </h2>
                <p className="text-xs text-warm-gray mt-1">
                  Ubah email, nama, atau password akun Anda.
                </p>
              </div>
              <UserSettings onSaved={handleRefresh} />
            </section>
          </div>
        )}

        {activeTab === "users" && (
          <div className="animate-fade-in-up">
            <section className="rounded-[32px] bg-white p-6 sm:p-8 shadow-soft ring-1 ring-warm-sand/30">
              <div className="mb-8">
                <h2 className="font-display text-xl font-extrabold text-dark-brown flex items-center gap-2">
                  <Users className="h-5 w-5 text-terracotta" />
                  Manajemen Pengguna
                </h2>
                <p className="text-xs text-warm-gray mt-1">
                  Tambah, lihat, dan hapus akun pengguna.
                </p>
              </div>
              <UserList key={refreshKey} currentUserId={currentUserId} onRefresh={handleRefresh} />
            </section>
          </div>
        )}
      </div>
    </div>
  );
}