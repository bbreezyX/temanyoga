"use client";

import { useState, useEffect } from "react";
import { Puzzle, Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { apiFetch } from "@/lib/api-client";
import type { AccessoryItem, CartAccessory } from "@/types/api";

interface AccessoriesSelectorProps {
  onAccessoriesChange: (accessories: CartAccessory[], total: number) => void;
}

export function AccessoriesSelector({ onAccessoriesChange }: AccessoriesSelectorProps) {
  const [accessories, setAccessories] = useState<AccessoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAccessories, setSelectedAccessories] = useState<Map<string, string>>(new Map());
  const [selectedIndependent, setSelectedIndependent] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadAccessories() {
      const res = await apiFetch<AccessoryItem[]>("/api/accessories");
      if (res.success) {
        setAccessories(res.data);
      }
      setLoading(false);
    }
    loadAccessories();
  }, []);

  useEffect(() => {
    const result: CartAccessory[] = [];
    for (const [, accId] of selectedAccessories) {
      const acc = accessories.find((a) => a.id === accId);
      if (acc) result.push({ id: acc.id, name: acc.name, price: acc.price, groupName: acc.groupName });
    }
    for (const accId of selectedIndependent) {
      const acc = accessories.find((a) => a.id === accId);
      if (acc) result.push({ id: acc.id, name: acc.name, price: acc.price, groupName: acc.groupName });
    }
    const total = result.reduce((s, a) => s + a.price, 0);
    onAccessoriesChange(result, total);
  }, [selectedAccessories, selectedIndependent, accessories, onAccessoriesChange]);

  const groups = new Map<string, AccessoryItem[]>();
  const independentAccessories: AccessoryItem[] = [];
  for (const acc of accessories) {
    if (acc.groupName) {
      if (!groups.has(acc.groupName)) groups.set(acc.groupName, []);
      groups.get(acc.groupName)!.push(acc);
    } else {
      independentAccessories.push(acc);
    }
  }

  const handleGroupSelect = (groupName: string, accId: string | null) => {
    setSelectedAccessories((prev) => {
      const next = new Map(prev);
      if (accId) {
        next.set(groupName, accId);
      } else {
        next.delete(groupName);
      }
      return next;
    });
  };

  const handleIndependentToggle = (accId: string) => {
    setSelectedIndependent((prev) => {
      const next = new Set(prev);
      if (next.has(accId)) {
        next.delete(accId);
      } else {
        next.add(accId);
      }
      return next;
    });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-3 py-4">
        <Loader2 className="w-5 h-5 animate-spin text-[#c85a2d]" />
        <span className="text-[14px] text-[#6b5b4b]">Memuat aksesoris...</span>
      </div>
    );
  }

  if (accessories.length === 0) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Puzzle className="w-5 h-5 text-[#c85a2d]" />
        <span className="text-[13px] md:text-[14px] font-black text-[#3f3328] uppercase tracking-wider">
          Pilih Aksesoris
        </span>
      </div>

      {[...groups.entries()].map(([groupName, groupItems]) => (
        <div key={groupName} className="space-y-3">
          <p className="text-[12px] md:text-[13px] font-bold text-[#5a4a3b] uppercase tracking-wider">
            {groupName}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            <label
              className={`flex items-center gap-3 md:gap-4 rounded-2xl p-3 md:p-4 cursor-pointer transition-all ring-1 ${
                !selectedAccessories.has(groupName)
                  ? "bg-[#fdf8f6] ring-[#c85a2d]/40 ring-2"
                  : "bg-[#fcfaf8] ring-[#e8dcc8] hover:ring-[#c85a2d]/20"
              }`}
            >
              <input
                type="radio"
                name={`group-${groupName}`}
                checked={!selectedAccessories.has(groupName)}
                onChange={() => handleGroupSelect(groupName, null)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded-full ring-2 shrink-0 flex items-center justify-center transition-all ${
                  !selectedAccessories.has(groupName)
                    ? "ring-[#c85a2d] bg-[#c85a2d]"
                    : "ring-[#d4c5b3] bg-white"
                }`}
              >
                {!selectedAccessories.has(groupName) && (
                  <div className="w-2 h-2 rounded-full bg-white"></div>
                )}
              </div>
              <div className="flex-1">
                <p className="font-bold text-[13px] md:text-[14px] text-[#6b5b4b]">Tidak ada</p>
              </div>
              <span className="text-[13px] md:text-[14px] font-bold text-[#9a8772]">—</span>
            </label>
            {groupItems.map((acc) => {
              const isSelected = selectedAccessories.get(groupName) === acc.id;
              return (
                <label
                  key={acc.id}
                  className={`flex items-center gap-3 md:gap-4 rounded-2xl p-3 md:p-4 cursor-pointer transition-all ring-1 ${
                    isSelected
                      ? "bg-[#fdf8f6] ring-[#c85a2d]/40 ring-2"
                      : "bg-[#fcfaf8] ring-[#e8dcc8] hover:ring-[#c85a2d]/20"
                  }`}
                >
                  <input
                    type="radio"
                    name={`group-${groupName}`}
                    checked={isSelected}
                    onChange={() => handleGroupSelect(groupName, acc.id)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-full ring-2 shrink-0 flex items-center justify-center transition-all ${
                      isSelected
                        ? "ring-[#c85a2d] bg-[#c85a2d]"
                        : "ring-[#d4c5b3] bg-white"
                    }`}
                  >
                    {isSelected && (
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[13px] md:text-[14px] text-slate-900 truncate">{acc.name}</p>
                    {acc.description && (
                      <p className="text-[11px] md:text-[12px] text-[#6b5b4b] mt-0.5 line-clamp-1">{acc.description}</p>
                    )}
                  </div>
                  <span className="font-black text-[13px] md:text-[14px] text-[#c85a2d] shrink-0">
                    +{formatCurrency(acc.price)}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ))}

      {independentAccessories.length > 0 && (
        <div className="space-y-3">
          <p className="text-[12px] md:text-[13px] font-bold text-[#5a4a3b] uppercase tracking-wider">
            Tambahan
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            {independentAccessories.map((acc) => {
              const isSelected = selectedIndependent.has(acc.id);
              return (
                <label
                  key={acc.id}
                  className={`flex items-center gap-3 md:gap-4 rounded-2xl p-3 md:p-4 cursor-pointer transition-all ring-1 ${
                    isSelected
                      ? "bg-[#fdf8f6] ring-[#c85a2d]/40 ring-2"
                      : "bg-[#fcfaf8] ring-[#e8dcc8] hover:ring-[#c85a2d]/20"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleIndependentToggle(acc.id)}
                    className="sr-only"
                  />
                  <div
                    className={`w-5 h-5 rounded-md ring-2 shrink-0 flex items-center justify-center transition-all ${
                      isSelected
                        ? "ring-[#c85a2d] bg-[#c85a2d]"
                        : "ring-[#d4c5b3] bg-white"
                    }`}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-[13px] md:text-[14px] text-slate-900 truncate">{acc.name}</p>
                    {acc.description && (
                      <p className="text-[11px] md:text-[12px] text-[#6b5b4b] mt-0.5 line-clamp-1">{acc.description}</p>
                    )}
                  </div>
                  <span className="font-black text-[13px] md:text-[14px] text-[#c85a2d] shrink-0">
                    +{formatCurrency(acc.price)}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      )}

      {(selectedAccessories.size > 0 || selectedIndependent.size > 0) && (
        <div className="rounded-2xl bg-[#7a9d7f]/10 ring-1 ring-[#7a9d7f]/20 p-4">
          <p className="text-[11px] md:text-[12px] font-bold text-[#5a6a58] uppercase tracking-wider mb-2">
            Aksesoris Terpilih
          </p>
          <div className="space-y-1">
            {[...selectedAccessories.values()].map((accId) => {
              const acc = accessories.find((a) => a.id === accId);
              if (!acc) return null;
              return (
                <div key={acc.id} className="flex justify-between text-[12px] md:text-[13px]">
                  <span className="text-[#3f3328] font-medium">{acc.name}</span>
                  <span className="text-[#7a9d7f] font-bold">+{formatCurrency(acc.price)}</span>
                </div>
              );
            })}
            {[...selectedIndependent.values()].map((accId) => {
              const acc = accessories.find((a) => a.id === accId);
              if (!acc) return null;
              return (
                <div key={acc.id} className="flex justify-between text-[12px] md:text-[13px]">
                  <span className="text-[#3f3328] font-medium">{acc.name}</span>
                  <span className="text-[#7a9d7f] font-bold">+{formatCurrency(acc.price)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}