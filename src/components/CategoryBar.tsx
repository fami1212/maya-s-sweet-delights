import { useCategories } from "@/hooks/useMenu";
import type { Category } from "@/hooks/useMenu";

interface CategoryBarProps {
  activeCategory: string;
  onSelect: (id: string) => void;
}

const CategoryBar = ({ activeCategory, onSelect }: CategoryBarProps) => {
  const { data: categories, isLoading } = useCategories();

  return (
    <div className="sticky top-[61px] z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-3">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide" style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}>
          <button
            onClick={() => onSelect("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            Tout 🍽️
          </button>
          {!isLoading && categories?.map((cat: Category) => (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-secondary text-secondary-foreground hover:bg-accent"
              }`}
            >
              {cat.emoji} {cat.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryBar;
