import { X, Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

const CartDrawer = ({ open, onClose }: CartDrawerProps) => {
  const { items, updateQuantity, removeItem, clearCart, totalPrice } = useCart();

  const handleOrder = () => {
    if (items.length === 0) return;
    toast.success("Commande envoyée ! Merci 💖");
    clearCart();
    onClose();
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-foreground/20 z-50" onClick={onClose} />}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-border z-50 transform transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h2 className="font-heading text-xl font-bold">Mon Panier 🛒</h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-secondary transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <span className="text-5xl mb-4">🛒</span>
                <p>Votre panier est vide</p>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="bg-card rounded-lg border border-border p-3 flex items-center gap-3">
                  <span className="text-2xl">{item.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-card-foreground truncate">{item.name}</p>
                    <p className="text-sm text-primary font-bold">{(item.price * item.quantity).toFixed(2)} €</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 rounded-full bg-secondary hover:bg-accent transition-colors">
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-6 text-center font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 rounded-full bg-secondary hover:bg-accent transition-colors">
                      <Plus className="h-4 w-4" />
                    </button>
                    <button onClick={() => removeItem(item.id)} className="p-1 rounded-full hover:bg-destructive/10 transition-colors text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {items.length > 0 && (
            <div className="p-4 border-t border-border space-y-3">
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-primary">{totalPrice.toFixed(2)} €</span>
              </div>
              <button
                onClick={handleOrder}
                className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all shadow-lg"
              >
                Commander 💖
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CartDrawer;
