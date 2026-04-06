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
      <div className="container mx-auto px-4 py-12 text-center text-muted-foreground">
        Chargement du menu...
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
      <div className="container mx-auto px-4 py-8">
        <h2 className="font-heading text-3xl font-bold text-foreground mb-6">Notre Menu</h2>
        {grouped.map((group) => (
          <div key={group.id} className="mb-8">
            <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
              {group.emoji} {group.name}
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
