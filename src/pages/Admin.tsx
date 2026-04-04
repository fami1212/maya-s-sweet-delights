import { useState } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminMenu from "@/components/admin/AdminMenu";
import AdminOrders from "@/components/admin/AdminOrders";
import { LogOut, UtensilsCrossed, ShoppingBag, LayoutDashboard } from "lucide-react";
import logo from "@/assets/mayas-logo.png";

const AdminPage = () => {
  const { session, isAdmin, loading, signIn, signOut } = useAdminAuth();
  const [tab, setTab] = useState<"orders" | "menu">("orders");

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
    <div className="min-h-screen bg-background">
      {/* Top nav */}
      <nav className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Maya's" className="h-10 w-auto" />
            <span className="font-heading text-lg font-bold hidden sm:inline">Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setTab("orders")}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${tab === "orders" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Commandes</span>
            </button>
            <button
              onClick={() => setTab("menu")}
              className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all ${tab === "menu" ? "bg-primary text-primary-foreground" : "hover:bg-secondary"}`}
            >
              <UtensilsCrossed className="h-4 w-4" />
              <span className="hidden sm:inline">Menu</span>
            </button>
            <button onClick={signOut} className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground">
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-4 py-6">
        {tab === "orders" && <AdminOrders />}
        {tab === "menu" && <AdminMenu />}
      </main>
    </div>
  );
};

export default AdminPage;
