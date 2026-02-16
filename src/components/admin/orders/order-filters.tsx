"use client";

import { OrderStatus } from "@/generated/prisma/enums";
import { Input } from "@/components/ui/input";
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
    <div className="flex flex-col sm:flex-row gap-3">
      <Input
        placeholder="Cari kode pesanan atau nama..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="sm:max-w-xs"
      />
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger className="sm:w-[200px]">
          <SelectValue placeholder="Semua Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Status</SelectItem>
          {STATUS_OPTIONS.map((s) => (
            <SelectItem key={s} value={s}>
              {getStatusLabel(s)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
