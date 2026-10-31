import type { Product, ProductCategory } from '@/types/menu';
import bagelGreenBeePhoto from '@/assets/images/products/bagel-green-bee.webp';
import bagelTurkeyBeePhoto from '@/assets/images/products/bagel-turkey-bee.webp';

export const MENU_FILTERS: { value: ProductCategory | 'todo'; label: string }[] = [
  { value: 'todo', label: 'Todo' },
  { value: 'cafe', label: 'Café' },
  { value: 'matcha', label: 'Matcha' },
  { value: 'bagel', label: 'Bagels' },
];

export const products: Product[] = [
  {
    id: 'banana-latte',
    name: 'Banana Latte',
    category: 'cafe',
    kind: 'drink',
    description: 'Leche y plátano, con café helado y caramelo en el vaso.',
    photo: null,
    variants: [
      { temperature: 'frio', size: 16, price: 45 },
      { temperature: 'frio', size: 32, price: 75 },
    ],
  },
  {
    id: 'banana-matcha',
    name: 'Banana Matcha',
    category: 'matcha',
    kind: 'drink',
    description: 'Leche y plátano, con matcha y caramelo en el vaso.',
    photo: null,
    variants: [
      { temperature: 'frio', size: 16, price: 45 },
      { temperature: 'frio', size: 32, price: 80 },
    ],
  },
  {
    id: 'caramel-latte',
    name: 'Caramel Latte',
    category: 'cafe',
    kind: 'drink',
    description: 'Latte con salsa de caramelo y caramelo en el vaso.',
    photo: null,
    variants: [
      { temperature: 'frio', size: 16, price: 50 },
      { temperature: 'caliente', size: 16, price: 50 },
      { temperature: 'frio', size: 32, price: 80 },
    ],
  },
  {
    id: 'vanilla-sea-matcha',
    name: 'Vanilla Sea Matcha',
    category: 'matcha',
    kind: 'drink',
    description: 'Matcha con leche, azúcar morena y cold foam de vainilla.',
    photo: null,
    variants: [
      { temperature: 'frio', size: 16, price: 50 },
      { temperature: 'frio', size: 32, price: 85 },
    ],
  },
  {
    id: 'pumpkin-spice',
    name: 'Pumpkin Spice',
    category: 'cafe',
    kind: 'drink',
    description: 'Café con notas de calabaza y especias, con cold foam.',
    photo: null,
    variants: [
      { temperature: 'frio', size: 16, price: 60 },
      { temperature: 'caliente', size: 16, price: 60 },
      { temperature: 'frio', size: 32, price: 85 },
    ],
  },
  {
    id: 'toffee-nut',
    name: 'Toffee Nut',
    category: 'cafe',
    kind: 'drink',
    description: null,
    photo: null,
    variants: [{ temperature: 'caliente', size: 16, price: 50 }],
  },
  {
    id: 'green-bee-bagel',
    name: 'Green Bee Bagel',
    category: 'bagel',
    kind: 'food',
    description: 'Bagel tostado con queso crema, aguacate, huevo y ensalada.',
    photo: bagelGreenBeePhoto,
    price: 65,
  },
  {
    id: 'turkey-bee-bagel',
    name: 'Turkey Bee Bagel',
    category: 'bagel',
    kind: 'food',
    description: 'Bagel tostado con queso crema, pechuga de pavo y ensalada.',
    photo: bagelTurkeyBeePhoto,
    price: 65,
  },
  {
    id: 'morning-bee-bagel',
    name: 'Morning Bee Bagel',
    category: 'bagel',
    kind: 'food',
    description: 'Bagel tostado con queso crema, huevo y tocino.',
    photo: null,
    price: 70,
  },
];

const productsById = new Map(products.map((product) => [product.id, product]));

export function getProductById(id: string): Product | undefined {
  return productsById.get(id);
}
