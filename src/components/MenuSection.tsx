import { useState } from "react";
import { useMenuItems, useCategories } from "@/hooks/useMenu";
import CategoryBar from "./CategoryBar";
import MenuItemCard from "./MenuItemCard";

const MenuSection = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const { data: items, isLoading: loadingItems } = useMenuItems();
  const { data: categories } = useCategories();

  if (loadingItems) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Chargement du menu...
        </div>
      </div>
    );
  }

  const filtered = activeCategory === "all"
    ? items || []
    : (items || []).filter((i) => i.category_id === activeCategory);

  const grouped = activeCategory === "all"
    ? (categories || [])
        .map((cat) => ({
          ...cat,
          items: (items || []).filter((i) => i.category_id === cat.id),
        }))
        .filter((g) => g.items.length > 0)
    : [{
        id: activeCategory,
        name: categories?.find((c) => c.id === activeCategory)?.name || "",
        emoji: categories?.find((c) => c.id === activeCategory)?.emoji || "",
        sort_order: 0,
        items: filtered,
      }];

  return (
    <div className="overflow-x-hidden">
      <CategoryBar activeCategory={activeCategory} onSelect={setActiveCategory} />
      <div className="container mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
            Notre Menu
          </h2>
          <p className="text-muted-foreground mt-2">Découvrez nos délicieuses spécialités ✨</p>
        </div>
        {grouped.map((group) => (
          <div key={group.id} className="mb-12">
            <div className="flex items-center gap-3 mb-5">
              <span className="text-2xl">{group.emoji}</span>
              <h3 className="font-heading text-xl md:text-2xl font-bold text-foreground">
                {group.name}
              </h3>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid gap-4 grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {group.items.map((item) => (
                <MenuItemCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MenuSection;
