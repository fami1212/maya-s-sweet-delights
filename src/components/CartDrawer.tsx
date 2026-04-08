import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useTable } from "@/context/TableContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const TRACKING_STORAGE_KEY = "maya-active-order";

const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();
  const { tableNumber } = useTable();
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleOrder = async () => {
    if (items.length === 0) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error("Veuillez remplir votre nom et numéro de téléphone");
      return;
    }

    setSubmitting(true);
    try {
      const orderId = crypto.randomUUID();
      const trimmedName = customerName.trim();
      const trimmedPhone = customerPhone.trim();

      const orderData: Record<string, string | number> = {
        id: orderId,
        customer_name: trimmedName,
        customer_phone: trimmedPhone,
        total: totalPrice,
        status: "pending",
      };

      if (tableNumber) {
        orderData.table_number = tableNumber;
        orderData.notes = `Table ${tableNumber}`;
      }

      const { error: orderError } = await supabase.from("orders").insert(orderData);
      if (orderError) throw orderError;

      const orderItems = items.map((item) => ({
        order_id: orderId,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
      }));

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
      if (itemsError) throw itemsError;

      window.localStorage.setItem(
        TRACKING_STORAGE_KEY,
        JSON.stringify({
          orderId,
          customerName: trimmedName,
          customerPhone: trimmedPhone,
        }),
      );
      window.dispatchEvent(new Event("maya-order-tracking-updated"));

      toast.success("Commande envoyée avec succès ! Suivez maintenant son avancement en direct 💖");
      clearCart();
      setCustomerName("");
      setCustomerPhone("");
      onClose();
    } catch (err) {
      toast.error("Erreur lors de la commande. Réessayez.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-foreground/20 z-50" onClick={onClose} />}
      <div
        className={`fixed inset-0 md:inset-auto md:top-0 md:right-0 md:h-full md:w-full md:max-w-md bg-background md:border-l border-border z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full max-h-[100dvh]">
          <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
            <h2 className="font-heading text-xl font-bold">Mon Panier 🛒</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <span className="text-5xl mb-4">🛒</span>
                <p>Votre panier est vide</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="bg-card rounded-lg border border-border p-3 flex items-center gap-3">
                  <span className="text-2xl flex-shrink-0">{item.categories?.emoji || "🍽️"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-card-foreground truncate">{item.name}</p>
                    <p className="text-sm text-primary font-bold">{(Number(item.price) * item.quantity).toLocaleString()} FCFA</p>
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full bg-secondary hover:bg-accent transition-colors">
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-5 text-center font-semibold text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full bg-secondary hover:bg-accent transition-colors">
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => removeItem(item.id)} className="p-1 rounded-full hover:bg-destructive/10 transition-colors text-destructive">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-4 border-t border-border space-y-3 flex-shrink-0">
              <input
                type="text"
                placeholder="Votre nom"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                maxLength={100}
              />
              <input
                type="tel"
                placeholder="Numéro de téléphone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                maxLength={20}
              />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{totalPrice.toLocaleString()} FCFA</span>
              </div>
              <button
                onClick={handleOrder}
                disabled={submitting}
                className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all shadow-lg disabled:opacity-50"
              >
                {submitting ? "Envoi..." : "Commander 💖"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
