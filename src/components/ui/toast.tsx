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
import {
  CircleCheck,
  X,
  AlertTriangle,
  Info,
  Loader2,
} from "lucide-react";
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
  custom: (content: ReactNode, options?: { duration?: number }) => string;
  dismiss: (id: string) => void;
  promise: <T>(
    promise: Promise<T>,
    options: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: unknown) => string);
    }
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
    [removeToast]
  );

  const updateToast = useCallback((id: string, update: Partial<Toast>) => {
    setToasts((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...update } : t))
    );
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      removeToast(id);
    },
    [removeToast]
  );

  const success = useCallback(
    (title: string, description?: string) =>
      addToast({ type: "success", title, description }),
    [addToast]
  );

  const error = useCallback(
    (title: string, description?: string) =>
      addToast({ type: "error", title, description }),
    [addToast]
  );

  const warning = useCallback(
    (title: string, description?: string) =>
      addToast({ type: "warning", title, description }),
    [addToast]
  );

  const info = useCallback(
    (title: string, description?: string) =>
      addToast({ type: "info", title, description }),
    [addToast]
  );

  const loading = useCallback(
    (title: string, description?: string) =>
      addToast({ type: "loading", title, description, duration: Infinity }),
    [addToast]
  );

  const custom = useCallback(
    (content: ReactNode, options?: { duration?: number }) => {
      const id = generateId();
      setCustomToasts((prev) => new Map(prev).set(id, { content, ...options }));
      if (options?.duration !== Infinity) {
        const duration = options?.duration ?? 4000;
        const timer = setTimeout(() => removeToast(id), duration);
        timersRef.current.set(id, timer);
      }
      return id;
    },
    [removeToast]
  );

  const promise = useCallback(
    async <T,>(
      p: Promise<T>,
      options: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: unknown) => string);
      }
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
    [loading, updateToast, removeToast]
  );

  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
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
    <div className="fixed bottom-4 left-4 right-4 sm:left-1/2 sm:right-auto sm:-translate-x-1/2 sm:w-auto z-[9999] flex flex-col items-center gap-3 pointer-events-none">
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
          "pointer-events-auto",
          isLeaving && "animate-toast-out"
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
      <div className="flex items-center justify-center size-8 rounded-xl bg-sage/20 text-sage">
        <CircleCheck className="size-4" {...props} />
      </div>
    ),
    error: (props) => (
      <div className="flex items-center justify-center size-8 rounded-xl bg-destructive/15 text-destructive">
        <X className="size-4" {...props} />
      </div>
    ),
    warning: (props) => (
      <div className="flex items-center justify-center size-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400">
        <AlertWarning className="size-4" {...props} />
      </div>
    ),
    info: (props) => (
      <div className="flex items-center justify-center size-8 rounded-xl bg-primary/15 text-primary">
        <Info className="size-4" {...props} />
      </div>
    ),
    loading: (props) => (
      <div className="flex items-center justify-center size-8 rounded-xl bg-primary/10 text-primary">
        <Loader2 className="size-4 animate-spin" {...props} />
      </div>
    ),
  };

  const Icon = iconMap[toast.type];

  const progressColorMap: Record<ToastType, string> = {
    success: "from-sage via-sage to-emerald-600",
    error: "from-destructive via-destructive to-red-700",
    warning: "from-amber-500 via-amber-500 to-amber-600",
    info: "from-primary via-primary to-sage",
    loading: "from-primary via-primary to-primary",
  };

  return (
    <div
      className={cn(
        "pointer-events-auto relative flex w-full sm:w-auto sm:min-w-[320px] sm:max-w-md items-center gap-3 rounded-2xl border border-border/50 bg-popover px-4 py-3 shadow-lift overflow-hidden",
        "animate-toast-in",
        isLeaving && "animate-toast-out"
      )}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className={cn(
          "absolute inset-0 pointer-events-none",
          toast.type === "success" && "bg-gradient-to-br from-sage/5 via-transparent to-sage/2",
          toast.type === "error" && "bg-gradient-to-br from-destructive/5 via-transparent to-destructive/2",
          toast.type === "warning" && "bg-gradient-to-br from-amber-500/5 via-transparent to-amber-500/2",
          toast.type === "info" && "bg-gradient-to-br from-primary/5 via-transparent to-sage/2"
        )}
      />

      {toast.type !== "loading" && (
        <div
          className={cn(
            "absolute bottom-0 left-0 h-[3px] bg-gradient-to-r rounded-b-2xl",
            progressColorMap[toast.type]
          )}
          style={{
            animation: !isPaused
              ? `toast-progress ${toast.duration ?? 4000}ms linear forwards`
              : "none",
          }}
        />
      )}

      <div className="relative flex-shrink-0 self-center">
        <Icon className="" />
      </div>

      <div className="relative flex-1 min-w-0 pr-8 flex flex-col justify-center">
        <p className="font-display text-[15px] font-bold text-foreground leading-snug">
          {toast.title}
        </p>
        {toast.description && (
          <p className="text-[13.5px] font-medium text-muted-foreground mt-0.5 leading-snug">
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
        className="absolute top-1/2 -translate-y-1/2 right-3 flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
};

const AlertWarning = AlertTriangle;