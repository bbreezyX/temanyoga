"use client";

import {
  createContext,
  useContext,
  useCallback,
  useState,
  useEffect,
  useRef,
  type ReactNode,
  type FC,
} from "react";
import { CircleCheck, X, AlertTriangle, Info, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "warning" | "info" | "loading";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  updateToast: (id: string, toast: Partial<Toast>) => void;
  success: (title: string, description?: string) => string;
  error: (title: string, description?: string) => string;
  warning: (title: string, description?: string) => string;
  info: (title: string, description?: string) => string;
  loading: (title: string, description?: string) => string;
  custom: (
    content: ReactNode,
    options?: { id?: string; duration?: number },
  ) => string;
  dismiss: (id: string) => void;
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    },
  ) => Promise<T>;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

let toastCount = 0;
function generateId() {
  return `toast-${++toastCount}`;
}

export const ToastProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [customToasts, setCustomToasts] = useState<
    Map<string, { content: ReactNode; duration?: number }>
  >(new Map());
  const timersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    setCustomToasts((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = generateId();
      const newToast = { ...toast, id };
      setToasts((prev) => [...prev, newToast]);

      if (toast.type !== "loading" && toast.duration !== Infinity) {
        const duration = toast.duration ?? 4000;
        const timer = setTimeout(() => removeToast(id), duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [removeToast],
  );

  const updateToast = useCallback((id: string, update: Partial<Toast>) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...update } : t)),
    );
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      removeToast(id);
    },
    [removeToast],
  );

  const success = useCallback(
    (title: string, description?: string) =>
      addToast({ type: "success", title, description }),
    [addToast],
  );

  const error = useCallback(
    (title: string, description?: string) =>
      addToast({ type: "error", title, description }),
    [addToast],
  );

  const warning = useCallback(
    (title: string, description?: string) =>
      addToast({ type: "warning", title, description }),
    [addToast],
  );

  const info = useCallback(
    (title: string, description?: string) =>
      addToast({ type: "info", title, description }),
    [addToast],
  );

  const loading = useCallback(
    (title: string, description?: string) =>
      addToast({ type: "loading", title, description, duration: Infinity }),
    [addToast],
  );

  const custom = useCallback(
    (content: ReactNode, options?: { id?: string; duration?: number }) => {
      const id = options?.id || generateId();

      // If ID already exists, we skip creating a timer and just update the content
      setCustomToasts((prev) => {
        const next = new Map(prev);
        // If it exists, it effectively "refreshes" the toast
        next.set(id, { content, ...options });
        return next;
      });

      if (options?.duration !== Infinity) {
        // Clear existing timer if any
        const existingTimer = timersRef.current.get(id);
        if (existingTimer) clearTimeout(existingTimer);

        const duration = options?.duration ?? 4000;
        const timer = setTimeout(() => removeToast(id), duration);
        timersRef.current.set(id, timer);
      }
      return id;
    },
    [removeToast],
  );

  const promise = useCallback(
    async <T,>(
      p: Promise<T>,
      options: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: unknown) => string);
      },
    ): Promise<T> => {
      const id = loading(options.loading);
      try {
        const result = await p;
        const successMsg =
          typeof options.success === "function"
            ? options.success(result)
            : options.success;
        updateToast(id, { type: "success", title: successMsg, duration: 4000 });
        setTimeout(() => removeToast(id), 4000);
        return result;
      } catch (err) {
        const errorMsg =
          typeof options.error === "function"
            ? options.error(err)
            : options.error;
        updateToast(id, { type: "error", title: errorMsg, duration: 4000 });
        setTimeout(() => removeToast(id), 4000);
        throw err;
      }
    },
    [loading, updateToast, removeToast],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        updateToast,
        success,
        error,
        warning,
        info,
        loading,
        custom,
        dismiss,
        promise,
      }}
    >
      {children}
      <ToastContainer
        toasts={toasts}
        customToasts={customToasts}
        onDismiss={dismiss}
      />
    </ToastContext.Provider>
  );
};

interface ToastContainerProps {
  toasts: Toast[];
  customToasts: Map<string, { content: ReactNode; duration?: number }>;
  onDismiss: (id: string) => void;
}

const ToastContainer: FC<ToastContainerProps> = ({
  toasts,
  customToasts,
  onDismiss,
}) => {
  return (
    <div className="fixed bottom-8 sm:bottom-auto sm:top-6 left-0 right-0 sm:left-auto sm:right-6 md:right-10 z-[10000] flex flex-col-reverse sm:flex-col items-center sm:items-end gap-3 pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onDismiss={() => onDismiss(toast.id)}
        />
      ))}
      {Array.from(customToasts.entries()).map(([id, { content }]) => (
        <ToastItem
          key={id}
          toast={{ id, type: "info", title: "" }}
          content={content}
          onDismiss={() => onDismiss(id)}
        />
      ))}
    </div>
  );
};

interface ToastItemProps {
  toast: Toast;
  content?: ReactNode;
  onDismiss: () => void;
}

const ToastItem: FC<ToastItemProps> = ({ toast, content, onDismiss }) => {
  const [isLeaving, setIsLeaving] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(onDismiss, 350);
  };

  if (content) {
    return (
      <div
        className={cn(
          "pointer-events-auto animate-toast-in",
          isLeaving && "animate-toast-out",
        )}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {content}
      </div>
    );
  }

  const iconMap: Record<ToastType, FC<{ className?: string }>> = {
    success: (props) => (
      <div className="flex items-center justify-center size-9 rounded-xl bg-sage/10 text-sage border border-sage/20">
        <CircleCheck className="size-5" {...props} />
      </div>
    ),
    error: (props) => (
      <div className="flex items-center justify-center size-9 rounded-xl bg-destructive/5 text-destructive border border-destructive/20">
        <X className="size-5" {...props} />
      </div>
    ),
    warning: (props) => (
      <div className="flex items-center justify-center size-9 rounded-xl bg-primary/10 text-primary border border-primary/20">
        <AlertTriangle className="size-5" {...props} />
      </div>
    ),
    info: (props) => (
      <div className="flex items-center justify-center size-9 rounded-xl bg-[#2d241c]/5 text-[#2d241c] border border-[#2d241c]/10">
        <Info className="size-5" {...props} />
      </div>
    ),
    loading: (props) => (
      <div className="flex items-center justify-center size-9 rounded-xl bg-primary/5 text-primary border border-primary/10">
        <Loader2 className="size-5 animate-spin" {...props} />
      </div>
    ),
  };

  const Icon = iconMap[toast.type];

  const progressColorMap: Record<ToastType, string> = {
    success: "from-sage to-sage/40",
    error: "from-destructive to-destructive/40",
    warning: "from-primary to-primary/40",
    info: "from-[#2d241c] to-[#2d241c]/40",
    loading: "from-primary to-primary/40",
  };

  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full sm:w-[420px] items-center gap-4 rounded-[28px] border border-border/80 bg-white/95 backdrop-blur-xl px-6 py-5 shadow-lift overflow-hidden",
        "animate-toast-in",
        isLeaving && "animate-toast-out",
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className={cn(
          "absolute inset-0 pointer-events-none opacity-40",
          toast.type === "success" &&
            "bg-gradient-to-br from-sage/5 via-transparent to-transparent",
          toast.type === "error" &&
            "bg-gradient-to-br from-destructive/5 via-transparent to-transparent",
          toast.type === "warning" &&
            "bg-gradient-to-br from-primary/5 via-transparent to-transparent",
          toast.type === "info" &&
            "bg-gradient-to-br from-[#2d241c]/5 via-transparent to-transparent",
        )}
      />

      {toast.type !== "loading" && (
        <div
          className={cn(
            "absolute bottom-0 left-0 h-[3px] bg-gradient-to-r",
            progressColorMap[toast.type],
          )}
          style={{
            transformOrigin: "left",
            animation: !isPaused
              ? `toast-progress ${toast.duration ?? 4000}ms linear forwards`
              : "none",
          }}
        />
      )}

      <div className="relative flex-shrink-0 self-center">
        <Icon className="size-5" />
      </div>

      <div className="relative flex-1 min-w-0 pr-6 flex flex-col justify-center">
        <p className="font-display text-[16px] font-black text-[#2d241c] leading-snug tracking-tight">
          {toast.title}
        </p>
        {toast.description && (
          <p className="text-[14px] font-medium text-[#6b5b4b] mt-1 leading-snug">
            {toast.description}
          </p>
        )}
        {toast.action && (
          <button
            onClick={() => {
              toast.action?.onClick();
              handleClose();
            }}
            className="mt-1.5 text-[12px] font-bold text-primary hover:underline uppercase tracking-wider text-left"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      <button
        onClick={handleClose}
        className="absolute top-1/2 -translate-y-1/2 right-4 flex h-8 w-8 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all active:scale-90"
      >
        <X className="size-4" />
      </button>
    </div>
  );
};
