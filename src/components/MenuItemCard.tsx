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
    <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col">
      {item.image_url ? (
        <div className="relative h-40 overflow-hidden">
          <img
            src={item.image_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
        </div>
      ) : (
        <div className="h-32 flex items-center justify-center bg-accent/30">
          <span className="text-6xl drop-shadow-sm">{emoji}</span>
        </div>
      )}
      <div className="p-4 flex-1 flex flex-col justify-between gap-2">
        <div>
          <h3 className="font-heading font-bold text-card-foreground text-base leading-tight">
            {item.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {item.description}
          </p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-primary font-bold text-lg">
            {Number(item.price).toLocaleString()} <span className="text-xs font-medium">FCFA</span>
          </span>
          <button
            onClick={handleAdd}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-md hover:shadow-lg active:scale-95"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MenuItemCard;
