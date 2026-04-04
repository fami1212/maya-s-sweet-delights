import { Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { MenuItem } from "@/hooks/useMenu";
import { toast } from "sonner";

const MenuItemCard = ({ item }: { item: MenuItem }) => {
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem(item);
    toast.success(`${item.name} ajouté au panier`);
  };

  const emoji = item.categories?.emoji || "🍽️";

  return (
    <div className="bg-card rounded-lg border border-border p-4 flex items-center gap-4 hover:shadow-md transition-shadow group">
      {item.image_url ? (
        <img src={item.image_url} alt={item.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0" loading="lazy" width={56} height={56} />
      ) : (
        <span className="text-4xl flex-shrink-0">{emoji}</span>
      )}
      <div className="flex-1 min-w-0">
        <h3 className="font-heading font-semibold text-card-foreground truncate">{item.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
        <p className="text-primary font-bold mt-1">{Number(item.price).toFixed(2)} €</p>
      </div>
      <button
        onClick={handleAdd}
        className="flex-shrink-0 p-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-sm hover:shadow-md"
      >
        <Plus className="h-5 w-5" />
      </button>
    </div>
  );
};

export default MenuItemCard;
