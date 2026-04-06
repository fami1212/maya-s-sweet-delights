import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import logo from "@/assets/mayas-logo.png";

interface NavbarProps {
  onCartClick: () => void;
}

const Navbar = ({ onCartClick }: NavbarProps) => {
  const { totalItems } = useCart();

  return (
    <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <img src={logo} alt="Maya's" className="h-12 w-auto" />
        <button
          onClick={onCartClick}
          className="relative p-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity hidden md:flex"
        >
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 bg-pink-dark text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
