import { Plus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import type { MenuItem } from "@/data/menuData";
import { toast } from "sonner";

const MenuItemCard = ({ item }: { item: MenuItem }) => {
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem(item);
    toast.success(`${item.name} ajouté au panier`);
  };

  return (
    <div className="bg-card rounded-lg border border-border p-4 flex items-center gap-4 hover:shadow-md transition-shadow group">
      <span className="text-4xl flex-shrink-0">{item.emoji}</span>
      <div className="flex-1 min-w-0">
        <h3 className="font-heading font-semibold text-card-foreground truncate">{item.name}</h3>
        <p className="text-sm text-muted-foreground line-clamp-1">{item.description}</p>
        <p className="text-primary font-bold mt-1">{item.price.toFixed(2)} €</p>
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
