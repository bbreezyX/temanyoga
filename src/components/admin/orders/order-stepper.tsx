"use client";

import { XCircle, CheckCircle } from "lucide-react";

const ORDER_STEPS = [
  { label: "Pesanan Dibuat", status: "PENDING_PAYMENT", step: 1 },
  { label: "Verifikasi", status: "AWAITING_VERIFICATION", step: 2 },
  { label: "Dibayar", status: "PAID", step: 3 },
  { label: "Diproses", status: "PROCESSING", step: 4 },
  { label: "Dalam Perjalanan", status: "SHIPPED", step: 5 },
  { label: "Sampai Tujuan", status: "COMPLETED", step: 6 },
] as const;

function getCurrentStep(status: string) {
  if (status === "CANCELLED") return -1;
  const index = ORDER_STEPS.findIndex((s) => s.status === status);
  return index !== -1 ? index + 1 : 0;
}

type OrderStepperProps = {
  status: string;
};

export function OrderStepper({ status }: OrderStepperProps) {
  const currentStep = getCurrentStep(status);

  if (status === "CANCELLED") {
    return (
      <div className="w-full p-4 bg-red-50 rounded-2xl border border-red-100 flex items-center justify-center gap-2 text-red-600 font-bold">
        <XCircle className="h-5 w-5" />
        Pesanan Dibatalkan
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <div className="absolute top-1/2 left-0 w-full h-1 bg-cream -translate-y-1/2 rounded-full -z-0"></div>
      <div
        className="absolute top-1/2 left-0 h-1 bg-sage -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out -z-0"
        style={{
          width: `${((currentStep - 1) / (ORDER_STEPS.length - 1)) * 100}%`,
        }}
      ></div>
      <div className="flex justify-between relative z-10 w-full">
        {ORDER_STEPS.map((step, idx) => {
          const isActive = idx + 1 <= currentStep;
          const isCurrent = idx + 1 === currentStep;
          return (
            <div
              key={step.step}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ring-4 ${
                  isActive
                    ? "bg-sage text-white ring-white shadow-lg scale-110"
                    : "bg-cream text-warm-gray ring-white"
                } ${isCurrent ? "ring-sage/20 scale-125" : ""}`}
              >
                {isActive ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  step.step
                )}
              </div>
              <span
                className={`hidden sm:block text-[10px] font-bold uppercase tracking-widest transition-colors duration-300 ${
                  isActive ? "text-sage" : "text-warm-gray/60"
                } ${isCurrent ? "text-dark-brown" : ""}`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-4 text-center sm:hidden">
        <p className="text-xs font-black uppercase tracking-widest text-dark-brown">
          Step {currentStep}: {ORDER_STEPS[currentStep - 1]?.label}
        </p>
      </div>
    </div>
  );
}