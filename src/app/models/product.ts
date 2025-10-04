export interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  image: string;
  price: number;
  rating: number;
  inStock: boolean;
  // New optional fields:
  featured?: boolean;
  originalPrice?: number;
}
