import { useState, useRef, useEffect } from "react";
import { CartProvider } from "@/context/CartContext";
import { TableProvider, useTable } from "@/context/TableContext";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MenuSection from "@/components/MenuSection";
import CartDrawer from "@/components/CartDrawer";
import BottomNav from "@/components/BottomNav";
import ChatBot from "@/components/ChatBot";
import OrderStatusTracker from "@/components/OrderStatusTracker";

const TableBanner = () => {
  const { tableNumber } = useTable();
  if (!tableNumber) return null;
  return (
    <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium">
      📍 Table {tableNumber} — Commandez directement depuis votre table !
    </div>
  );
};

const IndexContent = () => {
  const [cartOpen, setCartOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("home");
  const menuRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const { tableNumber } = useTable();

  useEffect(() => {
    if (tableNumber || window.location.hash === "#menu") {
      setTimeout(() => {
        menuRef.current?.scrollIntoView({ behavior: "smooth" });
        setActiveTab("menu");
      }, 500);
    }
  }, [tableNumber]);

  const scrollToMenu = () => {
    menuRef.current?.scrollIntoView({ behavior: "smooth" });
    setActiveTab("menu");
  };

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
    setActiveTab("home");
  };

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0" ref={topRef}>
      <TableBanner />
      <Navbar onCartClick={() => setCartOpen(true)} />
      <HeroSection onOrderClick={scrollToMenu} />
      <OrderStatusTracker />
      <div ref={menuRef} id="menu">
        <MenuSection />
      </div>
      <footer className="bg-secondary py-8 text-center">
        <p className="font-heading text-xl text-secondary-foreground">Maya's</p>
        <p className="text-sm text-muted-foreground mt-1">Crêperie • Fast Food • Glacier — Avec amour 💖</p>
      </footer>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      <BottomNav
        onHomeClick={scrollToTop}
        onMenuClick={scrollToMenu}
        onCartClick={() => setCartOpen(true)}
        activeTab={activeTab}
      />
      <ChatBot />
    </div>
  );
};

const Index = () => (
  <CartProvider>
    <TableProvider>
      <IndexContent />
    </TableProvider>
  </CartProvider>
);

export default Index;
