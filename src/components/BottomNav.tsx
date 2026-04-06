import { Home, UtensilsCrossed, ShoppingCart, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface BottomNavProps {
  onHomeClick: () => void;
  onMenuClick: () => void;
  onCartClick: () => void;
  activeTab: string;
}

const BottomNav = ({ onHomeClick, onMenuClick, onCartClick, activeTab }: BottomNavProps) => {
  const { totalItems } = useCart();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border md:hidden">
      <div className="flex items-center justify-around py-2">
        <button onClick={onHomeClick} className={`flex flex-col items-center gap-0.5 px-3 py-1 ${activeTab === "home" ? "text-primary" : "text-muted-foreground"}`}>
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-medium">Accueil</span>
        </button>
        <button onClick={onMenuClick} className={`flex flex-col items-center gap-0.5 px-3 py-1 ${activeTab === "menu" ? "text-primary" : "text-muted-foreground"}`}>
          <UtensilsCrossed className="h-5 w-5" />
          <span className="text-[10px] font-medium">Menu</span>
        </button>
        <button onClick={onCartClick} className="relative flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground">
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-0.5 right-1 bg-primary text-primary-foreground text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
              {totalItems}
            </span>
          )}
          <span className="text-[10px] font-medium">Panier</span>
        </button>
      </div>
    </nav>
  );
};

export default BottomNav;
