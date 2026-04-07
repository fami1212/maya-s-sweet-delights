import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminMenu from "@/components/admin/AdminMenu";
import AdminOrders from "@/components/admin/AdminOrders";
import AdminQRCodes from "@/components/admin/AdminQRCodes";
import { LogOut, UtensilsCrossed, ShoppingBag, QrCode } from "lucide-react";
import logo from "@/assets/mayas-logo.png";

const AdminPage = () => {
  const { session, isAdmin, loading, signIn, signOut } = useAdminAuth();
  const [tab, setTab] = useState<"orders" | "menu" | "qrcodes">("orders");

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    );
  }

  if (!session) {
    return <AdminLogin onLogin={signIn} />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="font-heading text-2xl font-bold">Accès refusé</h1>
          <p className="text-muted-foreground">Vous n'avez pas les droits administrateur.</p>
          <button onClick={signOut} className="px-4 py-2 rounded-full bg-primary text-primary-foreground">
            Se déconnecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-16 md:pb-0">
      {/* Desktop top nav */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border hidden md:block">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Maya's" className="h-10 w-auto" />
            <span className="font-heading text-lg font-bold">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab("orders")}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${tab === "orders" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
            >
              <ShoppingBag className="h-4 w-4" /> Commandes
            </button>
            <button
              onClick={() => setTab("menu")}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${tab === "menu" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
            >
              <UtensilsCrossed className="h-4 w-4" /> Menu
            </button>
            <button
              onClick={() => setTab("qrcodes")}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${tab === "qrcodes" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
            >
              <QrCode className="h-4 w-4" /> QR Codes
            </button>
            <button onClick={signOut} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border md:hidden">
        <div className="flex items-center justify-around py-2">
          <button onClick={() => setTab("orders")} className={`flex flex-col items-center gap-0.5 px-3 py-1 ${tab === "orders" ? "text-primary" : "text-muted-foreground"}`}>
            <ShoppingBag className="h-5 w-5" />
            <span className="text-[10px] font-medium">Commandes</span>
          </button>
          <button onClick={() => setTab("menu")} className={`flex flex-col items-center gap-0.5 px-3 py-1 ${tab === "menu" ? "text-primary" : "text-muted-foreground"}`}>
            <UtensilsCrossed className="h-5 w-5" />
            <span className="text-[10px] font-medium">Menu</span>
          </button>
          <button onClick={() => setTab("qrcodes")} className={`flex flex-col items-center gap-0.5 px-3 py-1 ${tab === "qrcodes" ? "text-primary" : "text-muted-foreground"}`}>
            <QrCode className="h-5 w-5" />
            <span className="text-[10px] font-medium">QR</span>
          </button>
          <button onClick={signOut} className="flex flex-col items-center gap-0.5 px-3 py-1 text-muted-foreground">
            <LogOut className="h-5 w-5" />
            <span className="text-[10px] font-medium">Déconnexion</span>
          </button>
        </div>
      </nav>

      {/* Mobile top bar (simplified) */}
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border md:hidden">
        <div className="px-4 py-3 flex items-center justify-center">
          <img src={logo} alt="Maya's" className="h-8 w-auto" />
          <span className="font-heading text-sm font-bold ml-2">Admin</span>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6">
        {tab === "orders" && <AdminOrders />}
        {tab === "menu" && <AdminMenu />}
      </main>
    </div>
  );
};

export default AdminPage;
