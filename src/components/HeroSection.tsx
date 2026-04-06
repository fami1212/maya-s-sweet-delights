import heroBg from "@/assets/hero-bg.jpg";

interface HeroSectionProps {
  onOrderClick: () => void;
}

const HeroSection = ({ onOrderClick }: HeroSectionProps) => {
  return (
    <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center overflow-hidden">
      <img src={heroBg} alt="Délices Maya's" className="absolute inset-0 w-full h-full object-cover" width={1920} height={1080} />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/30 to-background" />
      <div className="relative z-10 text-center px-4 animate-fade-in">
        <h1 className="font-heading text-5xl md:text-7xl font-bold text-foreground mb-4">
          Maya's
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-md mx-auto">
          Crêperie • Fast Food • Glacier
        </p>
        <button
          onClick={onOrderClick}
          className="px-8 py-3 rounded-full bg-primary text-primary-foreground font-semibold text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
        >
          Commander 🛒
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
