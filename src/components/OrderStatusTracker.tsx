import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock3, LoaderCircle, ReceiptText, X } from "lucide-react";

const STORAGE_KEY = "maya-active-order";
const ORDER_STATUS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/order-status`;

type StoredOrder = {
  orderId: string;
  customerPhone: string;
  customerName?: string;
};

type LiveOrder = {
  id: string;
  status: string;
  total: number;
  table_number: number | null;
  created_at: string;
  updated_at: string;
};

const statusMeta: Record<string, { label: string; tone: string; icon: JSX.Element }> = {
  pending: {
    label: "En attente",
    tone: "bg-secondary text-secondary-foreground",
    icon: <Clock3 className="h-4 w-4" />,
  },
  preparing: {
    label: "En préparation",
    tone: "bg-accent text-accent-foreground",
    icon: <LoaderCircle className="h-4 w-4" />,
  },
  ready: {
    label: "Prête à récupérer",
    tone: "bg-primary text-primary-foreground",
    icon: <ReceiptText className="h-4 w-4" />,
  },
  completed: {
    label: "Terminée",
    tone: "bg-muted text-foreground",
    icon: <CheckCircle2 className="h-4 w-4" />,
  },
  cancelled: {
    label: "Annulée",
    tone: "bg-destructive text-destructive-foreground",
    icon: <X className="h-4 w-4" />,
  },
};

const trackingSteps = ["pending", "preparing", "ready", "completed"];

const readStoredOrder = (): StoredOrder | null => {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredOrder) : null;
  } catch {
    return null;
  }
};

const OrderStatusTracker = () => {
  const [storedOrder, setStoredOrder] = useState<StoredOrder | null>(null);
  const [order, setOrder] = useState<LiveOrder | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearTracking = () => {
    window.localStorage.removeItem(STORAGE_KEY);
    setStoredOrder(null);
    setOrder(null);
    setError(null);
    window.dispatchEvent(new Event("maya-order-tracking-updated"));
  };

  useEffect(() => {
    const syncStoredOrder = () => {
      setStoredOrder(readStoredOrder());
    };

    syncStoredOrder();
    window.addEventListener("storage", syncStoredOrder);
    window.addEventListener("maya-order-tracking-updated", syncStoredOrder as EventListener);

    return () => {
      window.removeEventListener("storage", syncStoredOrder);
      window.removeEventListener("maya-order-tracking-updated", syncStoredOrder as EventListener);
    };
  }, []);

  useEffect(() => {
    if (!storedOrder) {
      setOrder(null);
      setLoading(false);
      setError(null);
      return;
    }

    let isMounted = true;

    const loadStatus = async () => {
      try {
        if (isMounted && !order) {
          setLoading(true);
        }

        const response = await fetch(ORDER_STATUS_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            orderId: storedOrder.orderId,
            phone: storedOrder.customerPhone,
          }),
        });

        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || "Impossible de récupérer le statut de la commande.");
        }

        if (isMounted) {
          setOrder(payload.order as LiveOrder);
          setError(null);
        }
      } catch (fetchError) {
        if (isMounted) {
          setError(fetchError instanceof Error ? fetchError.message : "Suivi indisponible pour le moment.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadStatus();
    const interval = window.setInterval(() => {
      void loadStatus();
    }, 5000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, [storedOrder, order]);

  const currentStatus = useMemo(() => {
    if (!order) return null;
    return statusMeta[order.status] || statusMeta.pending;
  }, [order]);

  const progressIndex = order ? trackingSteps.indexOf(order.status) : -1;

  if (!storedOrder) {
    return null;
  }

  return (
    <section className="container mx-auto px-4 pt-4">
      <div className="rounded-3xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted-foreground">
              Suivi de commande
            </p>
            <h2 className="mt-1 font-heading text-2xl font-bold text-foreground">
              #{storedOrder.orderId.slice(0, 8).toUpperCase()}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {storedOrder.customerName ? `${storedOrder.customerName} • ` : ""}
              {order?.table_number ? `Table ${order.table_number} • ` : ""}
              {order ? `${Number(order.total).toLocaleString()} FCFA` : "Recherche de votre commande..."}
            </p>
          </div>
          <button
            onClick={clearTracking}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-secondary-foreground transition-colors hover:bg-accent"
            aria-label="Masquer le suivi"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4">
          {loading && !order ? (
            <div className="rounded-2xl bg-secondary px-4 py-3 text-sm text-secondary-foreground">
              Chargement du statut de votre commande...
            </div>
          ) : error ? (
            <div className="rounded-2xl bg-destructive px-4 py-3 text-sm text-destructive-foreground">
              {error}
            </div>
          ) : order && currentStatus ? (
            <>
              <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium ${currentStatus.tone}`}>
                {currentStatus.icon}
                {currentStatus.label}
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2">
                {trackingSteps.map((step, index) => {
                  const active = progressIndex >= index;
                  const isCurrent = order.status === step;

                  return (
                    <div key={step} className="space-y-2 text-center">
                      <div
                        className={`mx-auto flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors ${
                          active
                            ? isCurrent
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-accent bg-accent text-accent-foreground"
                            : "border-border bg-background text-muted-foreground"
                        }`}
                      >
                        {index + 1}
                      </div>
                      <p className="text-xs text-muted-foreground">{statusMeta[step].label}</p>
                    </div>
                  );
                })}
              </div>

              <p className="mt-4 text-xs text-muted-foreground">
                Mise à jour automatique toutes les 5 secondes.
              </p>
            </>
          ) : null}
        </div>
      </div>
    </section>
  );
};

export default OrderStatusTracker;
