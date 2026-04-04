import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  emoji: string;
  sort_order: number;
}

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  image_url: string | null;
  available: boolean;
  sort_order: number;
}

const AdminMenu = () => {
  const queryClient = useQueryClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category_id: "",
    available: true,
    image_url: null as string | null,
  });

  const loadData = async () => {
    const [catRes, itemRes] = await Promise.all([
      supabase.from("categories").select("*").order("sort_order"),
      supabase.from("menu_items").select("*").order("sort_order"),
    ]);
    if (catRes.data) setCategories(catRes.data);
    if (itemRes.data) setItems(itemRes.data);
  };

  useEffect(() => { loadData(); }, []);

  const resetForm = () => {
    setForm({ name: "", description: "", price: "", category_id: "", available: true, image_url: null });
    setEditingItem(null);
    setShowForm(false);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description,
      price: String(item.price),
      category_id: item.category_id,
      available: item.available,
      image_url: item.image_url,
    });
    setShowForm(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("menu-images").upload(path, file);
    if (error) {
      toast.error("Erreur upload image");
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from("menu-images").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: urlData.publicUrl }));
    setUploading(false);
    toast.success("Image uploadée !");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      category_id: form.category_id,
      available: form.available,
      image_url: form.image_url,
    };

    if (editingItem) {
      const { error } = await supabase.from("menu_items").update(payload).eq("id", editingItem.id);
      if (error) { toast.error("Erreur modification"); return; }
      toast.success("Article modifié !");
    } else {
      const { error } = await supabase.from("menu_items").insert(payload);
      if (error) { toast.error("Erreur ajout"); return; }
      toast.success("Article ajouté !");
    }
    resetForm();
    loadData();
    queryClient.invalidateQueries({ queryKey: ["menu_items"] });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer cet article ?")) return;
    const { error } = await supabase.from("menu_items").delete().eq("id", id);
    if (error) { toast.error("Erreur suppression"); return; }
    toast.success("Article supprimé");
    loadData();
    queryClient.invalidateQueries({ queryKey: ["menu_items"] });
  };

  const toggleAvailable = async (item: MenuItem) => {
    await supabase.from("menu_items").update({ available: !item.available }).eq("id", item.id);
    loadData();
    queryClient.invalidateQueries({ queryKey: ["menu_items"] });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-heading text-2xl font-bold">Gestion du Menu</h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="px-4 py-2 rounded-full bg-primary text-primary-foreground font-semibold flex items-center gap-2 hover:opacity-90 transition-all"
        >
          <Plus className="h-4 w-4" /> Ajouter un article
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-semibold">{editingItem ? "Modifier" : "Nouvel article"}</h3>
            <button type="button" onClick={resetForm}><X className="h-5 w-5" /></button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Nom"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
              className="px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <input
              type="number"
              step="0.01"
              placeholder="Prix (€)"
              value={form.price}
              onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              required
              className="px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            rows={2}
          />
          <select
            value={form.category_id}
            onChange={(e) => setForm((f) => ({ ...f, category_id: e.target.value }))}
            required
            className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
          >
            <option value="">-- Catégorie --</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
            ))}
          </select>
          <div className="flex items-center gap-4 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.available}
                onChange={(e) => setForm((f) => ({ ...f, available: e.target.checked }))}
                className="accent-primary"
              />
              Disponible
            </label>
            <label className="flex items-center gap-2 cursor-pointer px-3 py-1.5 rounded-lg border border-border hover:bg-secondary transition-colors">
              <Upload className="h-4 w-4" />
              {uploading ? "Upload..." : "Image"}
              <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
            </label>
            {form.image_url && (
              <img src={form.image_url} alt="preview" className="h-10 w-10 rounded object-cover" />
            )}
          </div>
          <button
            type="submit"
            className="px-6 py-2 rounded-full bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-all"
          >
            {editingItem ? "Sauvegarder" : "Ajouter"}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {categories.map((cat) => {
          const catItems = items.filter((i) => i.category_id === cat.id);
          if (catItems.length === 0) return null;
          return (
            <div key={cat.id}>
              <h3 className="font-heading font-semibold text-lg mb-2">{cat.emoji} {cat.name}</h3>
              <div className="space-y-2">
                {catItems.map((item) => (
                  <div key={item.id} className={`flex items-center gap-3 p-3 rounded-lg border border-border ${!item.available ? "opacity-50" : ""}`}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="h-10 w-10 rounded object-cover flex-shrink-0" />
                    ) : (
                      <span className="text-2xl flex-shrink-0">{cat.emoji}</span>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{Number(item.price).toFixed(2)} €</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => toggleAvailable(item)} className={`px-2 py-1 text-xs rounded-full ${item.available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {item.available ? "Dispo" : "Indispo"}
                      </button>
                      <button onClick={() => handleEdit(item)} className="p-1.5 rounded-full hover:bg-secondary transition-colors">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded-full hover:bg-destructive/10 text-destructive transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminMenu;
