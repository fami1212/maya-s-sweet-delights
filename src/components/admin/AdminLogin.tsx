import { useState } from "react";
import { LogIn } from "lucide-react";

interface AdminLoginProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
}

const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await onLogin(email, password);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground">Maya's Admin</h1>
          <p className="text-muted-foreground mt-2">Connectez-vous pour gérer votre salon</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 bg-card p-6 rounded-lg border border-border">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <input
            type="password"
            placeholder="Mot de passe"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-3 rounded-lg border border-border bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary focus:outline-none"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-full bg-primary text-primary-foreground font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50"
          >
            <LogIn className="h-5 w-5" />
            {loading ? "Connexion..." : "Se connecter"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
