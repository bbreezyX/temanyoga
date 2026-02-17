"use client";

import { OrderStatus } from "@prisma/client";
import { Search, CalendarRange, Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStatusLabel } from "@/lib/format";

interface OrderFiltersProps {
  search: string;
  onSearchChange: (v: string) => void;
  status: string;
  onStatusChange: (v: string) => void;
}

const STATUS_OPTIONS = Object.values(OrderStatus);

export function OrderFilters({
  search,
  onSearchChange,
  status,
  onStatusChange,
}: OrderFiltersProps) {
  return (
    <div className="p-4 md:p-6 border-b border-warm-sand/30 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 w-full">
      <div className="flex w-full md:w-auto md:flex-1 md:min-w-[300px] items-center gap-3 rounded-full bg-cream px-4 md:px-5 py-3 ring-1 ring-warm-sand/50 focus-within:ring-terracotta/40 transition-all shadow-sm">
        <Search className="h-5 w-5 text-warm-gray shrink-0" />
        <input
          type="text"
          placeholder="Cari kode pesanan atau pelanggan..."
          className="w-full bg-transparent text-sm font-medium text-dark-brown placeholder:text-warm-gray/60 outline-none min-w-0"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full md:w-auto">
        <button className="flex-1 md:flex-none relative flex items-center justify-center gap-2 rounded-full bg-cream px-4 py-3 ring-1 ring-warm-sand/50 hover:bg-white transition-colors cursor-not-allowed opacity-70 whitespace-nowrap">
          <CalendarRange className="h-[18px] w-[18px] text-warm-gray" />
          <span className="text-sm font-bold text-dark-brown hidden sm:inline">
            Rentang Tanggal
          </span>
          <span className="text-sm font-bold text-dark-brown sm:hidden">
            Tanggal
          </span>
        </button>

        <div className="flex-1 md:flex-none min-w-[140px]">
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full rounded-full bg-cream px-4 md:px-5 py-6 text-sm font-bold text-dark-brown ring-1 ring-warm-sand/50 border-none shadow-none focus:ring-terracotta/40 md:w-[180px]">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent className="rounded-2xl border-warm-sand/50 shadow-xl overflow-hidden bg-white">
              <SelectItem value="all" className="font-medium focus:bg-cream">
                Semua Status
              </SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem
                  key={s}
                  value={s}
                  className="font-medium focus:bg-cream"
                >
                  {getStatusLabel(s)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <button className="flex h-11 w-11 items-center justify-center rounded-full bg-dark-brown text-white hover:scale-110 transition-transform shadow-lg shadow-dark-brown/20 shrink-0">
          <Filter className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
