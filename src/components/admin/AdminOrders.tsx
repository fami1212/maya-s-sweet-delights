import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Eye, Clock, CheckCircle, XCircle } from "lucide-react";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  status: string;
  total: number;
  notes: string | null;
  created_at: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  menu_items: { name: string } | null;
}

const statusLabels: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "En attente", color: "bg-yellow-100 text-yellow-800", icon: <Clock className="h-4 w-4" /> },
  preparing: { label: "En préparation", color: "bg-blue-100 text-blue-800", icon: <Clock className="h-4 w-4" /> },
  ready: { label: "Prêt", color: "bg-green-100 text-green-800", icon: <CheckCircle className="h-4 w-4" /> },
  completed: { label: "Terminé", color: "bg-muted text-muted-foreground", icon: <CheckCircle className="h-4 w-4" /> },
  cancelled: { label: "Annulé", color: "bg-red-100 text-red-800", icon: <XCircle className="h-4 w-4" /> },
};

const statuses = ["pending", "preparing", "ready", "completed", "cancelled"];

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [filterStatus, setFilterStatus] = useState("all");

  const loadOrders = async () => {
    const { data } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setOrders(data);
  };

  useEffect(() => { loadOrders(); }, []);

  const viewOrder = async (orderId: string) => {
    setSelectedOrder(orderId);
    const { data } = await supabase
      .from("order_items")
      .select("*, menu_items(name)")
      .eq("order_id", orderId);
    if (data) setOrderItems(data as OrderItem[]);
  };

  const updateStatus = async (orderId: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", orderId);
    if (error) { toast.error("Erreur mise à jour"); return; }
    toast.success(`Commande ${statusLabels[status]?.label || status}`);
    loadOrders();
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
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${info.color}`}>
                      {info.icon} {info.label}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{order.customer_phone}</p>
                  <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString("fr-FR")}</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-primary">{Number(order.total).toFixed(2)} €</span>
                  <button onClick={() => viewOrder(order.id)} className="p-2 rounded-full hover:bg-secondary transition-colors">
                    <Eye className="h-4 w-4" />
                  </button>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
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
                      <span className="text-muted-foreground">{(Number(oi.unit_price) * oi.quantity).toFixed(2)} €</span>
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
