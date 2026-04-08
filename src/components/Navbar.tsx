import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import logo from "@/assets/mayas-logo.png";

interface NavbarProps {
  onCartClick: () => void;
}

const Navbar = ({ onCartClick }: NavbarProps) => {
  const { totalItems } = useCart();

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <img src={logo} alt="Maya's" className="h-10 w-auto" />
          <div className="hidden sm:block">
            <p className="font-heading text-lg font-bold text-foreground leading-tight">Maya's</p>
            <p className="text-[10px] text-muted-foreground leading-tight">Crêperie • Fast Food • Glacier</p>
          </div>
        </div>
        <button
          onClick={onCartClick}
          className="relative p-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-md hidden md:flex"
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1.5 -right-1.5 bg-pink-dark text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-sm">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
