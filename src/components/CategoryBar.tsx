import { categories } from "@/data/menuData";

interface CategoryBarProps {
  activeCategory: string;
  onSelect: (id: string) => void;
}

const CategoryBar = ({ activeCategory, onSelect }: CategoryBarProps) => {
  return (
    <div className="sticky top-[61px] z-40 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4 py-3 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-max">
          <button
            onClick={() => onSelect("all")}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              activeCategory === "all"
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-secondary text-secondary-foreground hover:bg-accent"
            }`}
          >
            Tout 🍽️
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
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
