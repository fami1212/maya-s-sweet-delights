import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, Clock, CheckCircle, XCircle, Printer } from "lucide-react";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  total: number;
  notes: string | null;
  table_number: number | null;
  created_at: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  menu_items: { name: string } | null;
}

const statusLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "En attente", color: "bg-secondary text-secondary-foreground", icon: <Clock className="h-4 w-4" /> },
  preparing: { label: "En préparation", color: "bg-accent text-accent-foreground", icon: <Clock className="h-4 w-4" /> },
  ready: { label: "Prêt", color: "bg-primary text-primary-foreground", icon: <CheckCircle className="h-4 w-4" /> },
  completed: { label: "Terminé", color: "bg-muted text-muted-foreground", icon: <CheckCircle className="h-4 w-4" /> },
  cancelled: { label: "Annulé", color: "bg-destructive text-destructive-foreground", icon: <XCircle className="h-4 w-4" /> },
};

const statuses = ["pending", "preparing", "ready", "completed", "cancelled"];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");

  const loadOrders = useCallback(async () => {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) {
      console.error("Erreur chargement commandes:", error);
      return;
    }
    setOrders((data || []) as Order[]);
  }, []);

  const loadOrderItems = useCallback(async (orderId: string) => {
    const { data, error } = await supabase
      .from("order_items")
      .select("*, menu_items(name)")
      .eq("order_id", orderId);

    if (error) {
      console.error("Erreur chargement articles:", error);
      return [] as OrderItem[];
    }

    const parsed = (data || []) as OrderItem[];
    setOrderItems(parsed);
    return parsed;
  }, []);

  useEffect(() => {
    void loadOrders();

    const polling = window.setInterval(() => {
      void loadOrders();
    }, 5000);

    const channel = supabase
      .channel("admin-orders-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => {
        void loadOrders();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, () => {
        if (selectedOrder) {
          void loadOrderItems(selectedOrder);
        }
      })
      .subscribe();

    return () => {
      window.clearInterval(polling);
      void supabase.removeChannel(channel);
    };
  }, [loadOrderItems, loadOrders, selectedOrder]);

  useEffect(() => {
    if (!selectedOrder) {
      setOrderItems([]);
      return;
    }

    void loadOrderItems(selectedOrder);

    const polling = window.setInterval(() => {
      void loadOrderItems(selectedOrder);
    }, 5000);

    return () => {
      window.clearInterval(polling);
    };
  }, [loadOrderItems, selectedOrder]);

  const viewOrder = async (orderId: string) => {
    if (selectedOrder === orderId) {
      setSelectedOrder(null);
      setOrderItems([]);
      return;
    }

    setSelectedOrder(orderId);
    await loadOrderItems(orderId);
  };

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) {
      toast.error("Erreur mise à jour");
      return;
    }

    toast.success(`Commande ${statusLabels[status]?.label || status}`);
    void loadOrders();
  };

  const printReceipt = async (order: Order) => {
    const printWindow = window.open("", "_blank", "width=420,height=720");

    if (!printWindow) {
      toast.error("Autorisez les fenêtres pop-up pour imprimer le reçu.");
      return;
    }

    const items = await loadOrderItems(order.id);
    const status = statusLabels[order.status]?.label || order.status;
    const itemRows = items
      .map(
        (item) => `
          <tr>
            <td>${item.quantity} × ${item.menu_items?.name || "Article"}</td>
            <td style="text-align:right;">${(Number(item.unit_price) * item.quantity).toLocaleString("fr-FR")} FCFA</td>
          </tr>
        `,
      )
      .join("");

    printWindow.document.write(`
      <html lang="fr">
        <head>
          <title>Reçu ${order.id.slice(0, 8).toUpperCase()}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 24px; color: #111; }
            .receipt { max-width: 360px; margin: 0 auto; }
            h1 { margin: 0 0 8px; font-size: 24px; }
            p { margin: 4px 0; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            td { padding: 8px 0; border-bottom: 1px dashed #ccc; font-size: 14px; }
            .total { font-size: 18px; font-weight: 700; margin-top: 16px; }
            .muted { color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <h1>Maya's</h1>
            <p>Reçu de commande</p>
            <p class="muted">Réf. #${order.id.slice(0, 8).toUpperCase()}</p>
            <p class="muted">${new Date(order.created_at).toLocaleString("fr-FR")}</p>
            <p><strong>Client :</strong> ${order.customer_name}</p>
            <p><strong>Téléphone :</strong> ${order.customer_phone}</p>
            ${order.table_number ? `<p><strong>Table :</strong> ${order.table_number}</p>` : ""}
            <p><strong>Statut :</strong> ${status}</p>
            ${order.notes ? `<p><strong>Note :</strong> ${order.notes}</p>` : ""}
            <table>
              <tbody>${itemRows}</tbody>
            </table>
            <p class="total">Total : ${Number(order.total).toLocaleString("fr-FR")} FCFA</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  const filtered = filterStatus === "all" ? orders : orders.filter((o) => o.status === filterStatus);

  return (
    <div className="space-y-6">
      <h2 className="font-heading text-2xl font-bold">Commandes</h2>

      <div className="flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setFilterStatus("all")}
          className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filterStatus === "all" ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
        >
          Toutes ({orders.length})
        </button>
        {statuses.map((s) => {
          const count = orders.filter((o) => o.status === s).length;
          const info = statusLabels[s];
          return (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${filterStatus === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"}`}
            >
              {info?.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        {filtered.map((order) => {
          const info = statusLabels[order.status] || statusLabels.pending;
          return (
            <div key={order.id} className="bg-card border border-border rounded-lg p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{order.customer_name}</span>
                    {order.table_number && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                        📍 Table {order.table_number}
                      </span>
                    )}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${info.color}`}>
                      {info.icon} {info.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString("fr-FR")}</p>
                  {order.notes && <p className="text-xs text-muted-foreground italic mt-0.5">{order.notes}</p>}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-primary">{Number(order.total).toLocaleString()} FCFA</span>
                  <button
                    onClick={() => void printReceipt(order)}
                    className="inline-flex items-center justify-center p-2 rounded-full bg-secondary text-secondary-foreground hover:bg-accent transition-colors"
                    aria-label="Imprimer le reçu"
                  >
                    <Printer className="h-4 w-4" />
                  </button>
                  <button onClick={() => void viewOrder(order.id)} className="p-2 rounded-full hover:bg-secondary transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <select
                    value={order.status}
                    onChange={(e) => void updateStatus(order.id, e.target.value)}
                    className="text-sm px-2 py-1 rounded-lg border border-border bg-background"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>{statusLabels[s]?.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedOrder === order.id && orderItems.length > 0 && (
                <div className="mt-3 pt-3 border-t border-border space-y-1">
                  {orderItems.map((oi) => (
                    <div key={oi.id} className="flex justify-between text-sm">
                      <span>{oi.quantity}x {oi.menu_items?.name || "Article"}</span>
                      <span className="text-muted-foreground">{(Number(oi.unit_price) * oi.quantity).toLocaleString()} FCFA</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Aucune commande</p>
        )}
      </div>
    </div>
  );
};

export default AdminOrders;
