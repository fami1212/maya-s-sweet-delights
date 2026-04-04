import { useState, useRef } from "react";
import { menuItems, categories } from "@/data/menuData";
import CategoryBar from "./CategoryBar";
import MenuItemCard from "./MenuItemCard";

const MenuSection = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const ref = useRef<HTMLDivElement>(null);

  const filtered = activeCategory === "all"
    ? menuItems
    : menuItems.filter((i) => i.category === activeCategory);

  const grouped = activeCategory === "all"
    ? categories
        .map((cat) => ({
          ...cat,
          items: menuItems.filter((i) => i.category === cat.id),
        }))
        .filter((g) => g.items.length > 0)
    : [{ id: activeCategory, name: categories.find((c) => c.id === activeCategory)?.name || "", emoji: categories.find((c) => c.id === activeCategory)?.emoji || "", items: filtered }];

  return (
    <div ref={ref}>
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
