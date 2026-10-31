export type ProductCategory = 'cafe' | 'matcha' | 'bagel';

export type Temperature = 'frio' | 'caliente';

export type DrinkSize = 16 | 32;

export interface DrinkVariant {
  temperature: Temperature;
  size: DrinkSize;
  price: number;
}

interface BaseProduct {
  id: string;
  name: string;
  category: ProductCategory;
  description: string | null;
  photo: string | null;
}

export interface DrinkProduct extends BaseProduct {
  kind: 'drink';
  variants: DrinkVariant[];
}

export interface FoodProduct extends BaseProduct {
  kind: 'food';
  price: number;
}

export type Product = DrinkProduct | FoodProduct;

export interface Selection {
  temperature: Temperature | null;
  size: DrinkSize | null;
}

export interface CartLine extends Selection {
  productId: string;
  notes: string;
  quantity: number;
}
