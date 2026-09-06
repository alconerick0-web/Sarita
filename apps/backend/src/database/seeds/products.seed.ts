export const CATEGORIES_SEED = [
  { name: 'Sundaes',          description: 'Helados en copa',     icon: '🍨', sortOrder: 1 },
  { name: 'Banana',           description: 'Con banana',          icon: '🍌', sortOrder: 2 },
  { name: 'Batidos & Shakes', description: 'Bebidas de helado',   icon: '🥤', sortOrder: 3 },
  { name: 'Conos',            description: 'Helados en cono',     icon: '🍦', sortOrder: 4 },
  { name: 'Nevadas',          description: 'Helado con gaseosa',  icon: '🥂', sortOrder: 5 },
];

export interface StepData {
  desc: string;
  requiresFlavor?: boolean;
  requiresTopping?: boolean;
  flavorCount?: number;
}

export interface ProductData {
  name: string;
  categoryName: string;
  price: number;
  container: string;
  steps: StepData[];
  /** [ingredientName, quantityPerUnit] */
  ingredients: [string, number][];
}

export const PRODUCTS_SEED: ProductData[] = [
  {
    name: 'Banana Sundae', categoryName: 'Banana', price: 25, container: '12oz',
    steps: [
      { desc: 'Envase de 12oz' },
      { desc: '½ banana en trozos pequeños + 1 bola de helado 2oz', requiresFlavor: true },
      { desc: '½ banana en trozos + 1 bola de helado 2oz + ½oz de topping de fresa', requiresFlavor: true },
      { desc: 'Agregar 3oz de crema batida y 1 galleta redonda a un costado' },
      { desc: '1 cucharadita de maní/anicillos y colocar ½ guinda con el corte hacia abajo' },
      { desc: 'Entregar con cucharita y servilleta' },
    ],
    ingredients: [
      ['Envase 12oz', 1], ['Banana', 1], ['Helado', 4], ['Topping de Fresa', 0.5],
      ['Crema Batida', 3], ['Galleta Redonda', 1], ['Maní / Anicillos', 1],
      ['Guinda (cereza)', 1], ['Servilleta', 1], ['Cucharita', 1],
    ],
  },
  {
    name: 'Sundae Clásico', categoryName: 'Sundaes', price: 20, container: '9oz',
    steps: [
      { desc: 'Envase de 9oz' },
      { desc: '1 bola de helado de 3oz. Sabor a elección del cliente', requiresFlavor: true },
      { desc: '½oz de topping de fresa' },
      { desc: 'Agregar 2oz de crema batida' },
      { desc: '1 galleta redonda a un costado del logo, 1 cucharadita de maní o anicillos' },
      { desc: 'Entregar con cucharita y servilleta' },
    ],
    ingredients: [
      ['Envase 9oz', 1], ['Helado', 3], ['Topping de Fresa', 0.5],
      ['Crema Batida', 2], ['Galleta Redonda', 1], ['Maní / Anicillos', 1],
      ['Servilleta', 1], ['Cucharita', 1],
    ],
  },
  {
    name: 'Sundae Galleta', categoryName: 'Sundaes', price: 22, container: '9oz',
    steps: [
      { desc: 'Envase de 9oz' },
      { desc: '½oz de topping de chocolate' },
      { desc: '1 bola de helado de 3oz. Sabor galleta o elección del cliente', requiresFlavor: true },
      { desc: '3 cucharadas de galleta molida + ½oz de topping de chocolate' },
      { desc: 'Agregar 2oz de crema batida' },
      { desc: '1 galleta redonda a un costado del logo, 1 cucharadita de galleta molida' },
      { desc: 'Entregar con cucharita y servilleta' },
    ],
    ingredients: [
      ['Envase 9oz', 1], ['Topping de Chocolate', 1], ['Helado', 3],
      ['Galleta Molida', 4], ['Crema Batida', 2], ['Galleta Redonda', 1],
      ['Servilleta', 1], ['Cucharita', 1],
    ],
  },
  {
    name: 'Bomba', categoryName: 'Sundaes', price: 35, container: '22oz',
    steps: [
      { desc: 'Envase de 22oz' },
      { desc: '1 bola de helado de 2oz. Sabor a elección del cliente', requiresFlavor: true },
      { desc: 'Un banano entero en rodajas y ½oz de topping de piña' },
      { desc: '2 bolas de helado de 2oz del sabor a elección y 2 gajos de melocotón a los costados del logo', requiresFlavor: true, flavorCount: 2 },
      { desc: '½oz de topping de chocolate' },
      { desc: 'Agregar 3oz de crema batida, 1 galleta Waffle a un costado del logo, 1 cucharadita de maní, ½ guinda al centro' },
      { desc: 'Entregar con cuchara y servilleta' },
    ],
    ingredients: [
      ['Envase 22oz', 1], ['Helado', 6], ['Banana', 1], ['Topping de Piña', 0.5],
      ['Gajos de Melocotón', 2], ['Topping de Chocolate', 0.5], ['Crema Batida', 3],
      ['Galleta Waffle', 1], ['Maní / Anicillos', 1], ['Guinda (cereza)', 1],
      ['Servilleta', 1], ['Cucharita', 1],
    ],
  },
  {
    name: 'Banana Split', categoryName: 'Banana', price: 40, container: 'Envase Banana Split',
    steps: [
      { desc: 'Envase de banana' },
      { desc: '3 bolas de helado de 2oz. Colocar primero las de los bordes y la tercera al centro', requiresFlavor: true, flavorCount: 3 },
      { desc: '1 banano partido por la mitad y ½oz de topping de piña + ½oz de topping de fresa (un sabor de cada lado)' },
      { desc: 'Agregar 1oz de crema batida a cada lado y 1½oz al centro, 1 galleta redonda en cada lado, 1 cucharadita de maní, ½ guinda al centro con el corte hacia abajo' },
      { desc: 'Entregar con cucharita y servilleta' },
    ],
    ingredients: [
      ['Envase Banana Split', 1], ['Helado', 6], ['Banana', 1],
      ['Topping de Piña', 0.5], ['Topping de Fresa', 0.5], ['Crema Batida', 3.5],
      ['Galleta Redonda', 2], ['Maní / Anicillos', 1], ['Guinda (cereza)', 1],
      ['Servilleta', 1], ['Cucharita', 1],
    ],
  },
  {
    name: 'Sundae Especial', categoryName: 'Sundaes', price: 30, container: '12oz',
    steps: [
      { desc: 'Envase de 12oz' },
      { desc: '3 bolas de helado de 2oz. Sabor a elección del cliente', requiresFlavor: true, flavorCount: 3 },
      { desc: '2 gajos de melocotón y ½oz de topping de fresa' },
      { desc: 'Agregar 3oz de crema batida y 1 galleta redonda a un costado del logo' },
      { desc: '1 cucharadita de maní/anicillos y colocar ½ guinda con el corte hacia abajo' },
      { desc: 'Entregar con cucharita y servilleta' },
    ],
    ingredients: [
      ['Envase 12oz', 1], ['Helado', 6], ['Gajos de Melocotón', 2], ['Topping de Fresa', 0.5],
      ['Crema Batida', 3], ['Galleta Redonda', 1], ['Maní / Anicillos', 1],
      ['Guinda (cereza)', 1], ['Servilleta', 1], ['Cucharita', 1],
    ],
  },
  {
    name: 'Topping Sundae', categoryName: 'Sundaes', price: 18, container: '9oz',
    steps: [
      { desc: 'Envase de 9oz' },
      { desc: '1 bola de helado de 3oz. Sabor a elección del cliente', requiresFlavor: true },
      { desc: '½oz de topping según elección del cliente (fresa, chocolate o caramelo)', requiresTopping: true },
      { desc: 'Agregar 2oz de crema batida y ½oz de topping según elección anterior', requiresTopping: true },
      { desc: 'Entregar con cucharita y servilleta' },
    ],
    ingredients: [
      ['Envase 9oz', 1], ['Helado', 3], ['Topping de Fresa', 1],
      ['Crema Batida', 2], ['Servilleta', 1], ['Cucharita', 1],
    ],
  },
  {
    name: 'Nevada', categoryName: 'Nevadas', price: 25, container: '22oz',
    steps: [
      { desc: 'Envase de 22oz' },
      { desc: '2 bolas de helado de 3oz. Sabor según elección del cliente', requiresFlavor: true, flavorCount: 2 },
      { desc: 'Servir la mitad de la gaseosa haciendo espuma. Colocar cúpula' },
      { desc: 'Entregar nevada y el resto de la gaseosa al cliente, pajilla y servilleta' },
    ],
    ingredients: [
      ['Envase 22oz', 1], ['Helado', 6], ['Gaseosa 500mL', 1], ['Pajilla', 1], ['Servilleta', 1],
    ],
  },
  {
    name: 'Batido de Banano', categoryName: 'Batidos & Shakes', price: 22, container: '16oz',
    steps: [
      { desc: 'Envase de 16oz' },
      { desc: '1 bola de helado de 3oz sabor vainilla y 1 banano cortado en trozos pequeños' },
      { desc: 'Agregar todo el contenido de una Sarita Shake de 200mL sabor Vainilla, colocar cúpula y batir' },
      { desc: 'Agregar una pizca de canela' },
      { desc: 'Entregar con pajilla y servilleta' },
    ],
    ingredients: [
      ['Envase 16oz', 1], ['Helado', 3], ['Banana', 1], ['Sarita Shake 200mL', 1],
      ['Canela', 1], ['Pajilla', 1], ['Servilleta', 1],
    ],
  },
  {
    name: 'Milk Shake', categoryName: 'Batidos & Shakes', price: 24, container: '16oz',
    steps: [
      { desc: 'Envase de 16oz' },
      { desc: '3 bolas de helado de 2oz. Sabor según elección del cliente', requiresFlavor: true, flavorCount: 3 },
      { desc: 'Agregar todo el contenido de una Sarita Shake de 200mL, colocar cúpula y batir' },
      { desc: 'Entregar con pajilla y servilleta' },
    ],
    ingredients: [
      ['Envase 16oz', 1], ['Helado', 6], ['Sarita Shake 200mL', 1], ['Pajilla', 1], ['Servilleta', 1],
    ],
  },
  {
    name: 'Topping Shake', categoryName: 'Batidos & Shakes', price: 26, container: '16oz',
    steps: [
      { desc: 'Envase de 16oz' },
      { desc: '3 bolas de helado de 2oz. Sabor según elección del cliente', requiresFlavor: true, flavorCount: 3 },
      { desc: 'Agregar todo el contenido de una Sarita Shake de 200mL, colocar cúpula y batir' },
      { desc: 'Agregar 2oz de crema batida y ½oz de topping según sabor de helado', requiresTopping: true },
      { desc: 'Entregar con pajilla y servilleta' },
    ],
    ingredients: [
      ['Envase 16oz', 1], ['Helado', 6], ['Sarita Shake 200mL', 1],
      ['Crema Batida', 2], ['Topping de Fresa', 0.5], ['Pajilla', 1], ['Servilleta', 1],
    ],
  },
  {
    name: 'Cono Sencillo', categoryName: 'Conos', price: 10, container: 'Cono',
    steps: [
      { desc: 'Colocar funda Sarita para conos' },
      { desc: '1 bola de helado de 3oz. Sabor a elección del cliente', requiresFlavor: true },
      { desc: 'Entregar con servilleta' },
    ],
    ingredients: [
      ['Funda Sarita para Conos', 1], ['Helado', 3], ['Servilleta', 1],
    ],
  },
  {
    name: 'Cono Sencillo Capuchino', categoryName: 'Conos', price: 13, container: 'Cono',
    steps: [
      { desc: 'Colocar funda Sarita para conos' },
      { desc: '1 bola de helado de 3oz. Sabor a elección del cliente', requiresFlavor: true },
      { desc: 'Agregar cobertura de chocolate y maní o anicillos' },
      { desc: 'Entregar con servilleta' },
    ],
    ingredients: [
      ['Funda Sarita para Conos', 1], ['Helado', 3], ['Cobertura de Chocolate', 1],
      ['Maní / Anicillos', 1], ['Servilleta', 1],
    ],
  },
  {
    name: 'Cono Waffle', categoryName: 'Conos', price: 14, container: 'Cono Waffle',
    steps: [
      { desc: 'Colocar funda Sarita para conos' },
      { desc: '1 bola de helado de 3oz. Sabor a elección del cliente', requiresFlavor: true },
      { desc: 'Entregar con servilleta' },
    ],
    ingredients: [
      ['Funda Sarita para Conos', 1], ['Galleta Waffle', 1], ['Helado', 3], ['Servilleta', 1],
    ],
  },
  {
    name: 'Cono Waffle Capuchino', categoryName: 'Conos', price: 17, container: 'Cono Waffle',
    steps: [
      { desc: 'Colocar funda Sarita para conos' },
      { desc: '1 bola de helado de 3oz. Sabor a elección del cliente', requiresFlavor: true },
      { desc: 'Agregar cobertura de chocolate y maní o anicillos' },
      { desc: 'Entregar con servilleta' },
    ],
    ingredients: [
      ['Funda Sarita para Conos', 1], ['Galleta Waffle', 1], ['Helado', 3],
      ['Cobertura de Chocolate', 1], ['Maní / Anicillos', 1], ['Servilleta', 1],
    ],
  },
];
