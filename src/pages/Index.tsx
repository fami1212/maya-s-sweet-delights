import { useState, useRef } from "react";
import { CartProvider } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MenuSection from "@/components/MenuSection";
import CartDrawer from "@/components/CartDrawer";

const IndexContent = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const scrollToMenu = () => {
    menuRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onCartClick={() => setCartOpen(true)} />
      <HeroSection onOrderClick={scrollToMenu} />
      <div ref={menuRef}>
        <MenuSection />
      </div>
      <footer className="bg-secondary py-8 text-center">
        <p className="font-heading text-xl text-secondary-foreground">Maya's</p>
        <p className="text-sm text-muted-foreground mt-1">Salon de thé — Avec amour 💖</p>
      </footer>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
};

const Index = () => (
  <CartProvider>
    <IndexContent />
  </CartProvider>
);

export default Index;
