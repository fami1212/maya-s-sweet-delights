export interface MenuItem {
  id: string;
  name: string;
  emoji: string;
  category: string;
  price: number;
  description: string;
  image?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export const categories = [
  { id: "crepes", name: "Crêpes", emoji: "🥞" },
  { id: "gaufres", name: "Gaufres", emoji: "🧇" },
  { id: "poulet", name: "Poulet pané", emoji: "🍗" },
  { id: "hamburger", name: "Hamburger", emoji: "🍔" },
  { id: "donut", name: "Donut", emoji: "🍩" },
  { id: "barbe-a-papa", name: "Barbe à papa", emoji: "🍭" },
  { id: "popcorn", name: "Pop corn", emoji: "🍿" },
  { id: "jus", name: "Jus naturels", emoji: "🧃" },
  { id: "bubble-tea", name: "Bubble tea", emoji: "🧋" },
  { id: "verrines", name: "Verrines", emoji: "🍨" },
  { id: "gateaux-boites", name: "Gâteaux en boîtes", emoji: "🎂" },
  { id: "gateaux-anniversaire", name: "Gâteaux d'anniversaire", emoji: "🎂" },
  { id: "combo-school", name: "Combo school", emoji: "🎒" },
  { id: "combo-maxi", name: "Combo maxi", emoji: "⭐" },
];

export const menuItems: MenuItem[] = [
  { id: "c1", name: "Crêpe Nutella", emoji: "🥞", category: "crepes", price: 3.5, description: "Crêpe fraîche garnie de Nutella" },
  { id: "c2", name: "Crêpe Sucre", emoji: "🥞", category: "crepes", price: 2.5, description: "Crêpe classique au sucre" },
  { id: "c3", name: "Crêpe Confiture", emoji: "🥞", category: "crepes", price: 3.0, description: "Crêpe avec confiture maison" },
  { id: "g1", name: "Gaufre Nature", emoji: "🧇", category: "gaufres", price: 3.0, description: "Gaufre croustillante nature" },
  { id: "g2", name: "Gaufre Chocolat", emoji: "🧇", category: "gaufres", price: 4.0, description: "Gaufre nappée de chocolat fondant" },
  { id: "g3", name: "Gaufre Fruits", emoji: "🧇", category: "gaufres", price: 4.5, description: "Gaufre avec fruits frais de saison" },
  { id: "p1", name: "Poulet pané classique", emoji: "🍗", category: "poulet", price: 5.0, description: "Morceaux de poulet pané croustillant" },
  { id: "p2", name: "Poulet pané épicé", emoji: "🍗", category: "poulet", price: 5.5, description: "Poulet pané avec épices maison" },
  { id: "h1", name: "Hamburger Classic", emoji: "🍔", category: "hamburger", price: 6.0, description: "Burger bœuf, salade, tomate, sauce" },
  { id: "h2", name: "Hamburger Cheese", emoji: "🍔", category: "hamburger", price: 6.5, description: "Burger avec double fromage fondant" },
  { id: "d1", name: "Donut Glacé", emoji: "🍩", category: "donut", price: 2.5, description: "Donut avec glaçage au choix" },
  { id: "d2", name: "Donut Fourré", emoji: "🍩", category: "donut", price: 3.0, description: "Donut fourré chocolat ou confiture" },
  { id: "bp1", name: "Barbe à papa Classic", emoji: "🍭", category: "barbe-a-papa", price: 2.0, description: "Barbe à papa rose traditionnelle" },
  { id: "bp2", name: "Barbe à papa Multicolore", emoji: "🍭", category: "barbe-a-papa", price: 3.0, description: "Barbe à papa aux couleurs variées" },
  { id: "pc1", name: "Pop corn Sucré", emoji: "🍿", category: "popcorn", price: 2.0, description: "Pop corn fraîchement éclaté, sucré" },
  { id: "pc2", name: "Pop corn Caramel", emoji: "🍿", category: "popcorn", price: 2.5, description: "Pop corn enrobé de caramel" },
  { id: "j1", name: "Jus d'orange frais", emoji: "🧃", category: "jus", price: 3.0, description: "Orange pressée à la minute" },
  { id: "j2", name: "Jus Mangue", emoji: "🧃", category: "jus", price: 3.5, description: "Jus de mangue naturel" },
  { id: "j3", name: "Jus Fraise", emoji: "🧃", category: "jus", price: 3.5, description: "Jus de fraises fraîches" },
  { id: "bt1", name: "Bubble Tea Taro", emoji: "🧋", category: "bubble-tea", price: 4.5, description: "Bubble tea au taro avec perles" },
  { id: "bt2", name: "Bubble Tea Matcha", emoji: "🧋", category: "bubble-tea", price: 4.5, description: "Bubble tea matcha crémeux" },
  { id: "bt3", name: "Bubble Tea Fraise", emoji: "🧋", category: "bubble-tea", price: 4.5, description: "Bubble tea fraise rafraîchissant" },
  { id: "v1", name: "Verrine Tiramisu", emoji: "🍨", category: "verrines", price: 4.0, description: "Verrine tiramisu fait maison" },
  { id: "v2", name: "Verrine Fruits Rouges", emoji: "🍨", category: "verrines", price: 4.0, description: "Verrine crème et fruits rouges" },
  { id: "gb1", name: "Gâteau Chocolat (boîte)", emoji: "🎂", category: "gateaux-boites", price: 15.0, description: "Gâteau chocolat en boîte individuelle" },
  { id: "gb2", name: "Gâteau Vanille (boîte)", emoji: "🎂", category: "gateaux-boites", price: 15.0, description: "Gâteau vanille en boîte individuelle" },
  { id: "ga1", name: "Gâteau d'anniversaire S", emoji: "🎂", category: "gateaux-anniversaire", price: 25.0, description: "Gâteau personnalisé 6 parts" },
  { id: "ga2", name: "Gâteau d'anniversaire M", emoji: "🎂", category: "gateaux-anniversaire", price: 40.0, description: "Gâteau personnalisé 12 parts" },
  { id: "cs1", name: "Combo School", emoji: "🎒", category: "combo-school", price: 5.5, description: "Crêpe + jus + donut" },
  { id: "cm1", name: "Combo Maxi", emoji: "⭐", category: "combo-maxi", price: 9.0, description: "Burger + frites + boisson + dessert" },
];
