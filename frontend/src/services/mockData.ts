import type { Category } from "./category.service";
import type { Product } from "./product.service";
import type { User } from "./user.service";

export const MOCK_CATEGORIES: Category[] = [
  { idCategoria: "1", nombre: "Chaufas, tallarines y combinados" },
  { idCategoria: "2", nombre: "Platos de fondo" }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    idProducto: "1",
    idCategoria: "1",
    categoria: "Chaufas, tallarines y combinados",
    nombre: "Chaufa de Pollo",
    precio: "15.00",
    disponible: true,
    descripcion: "Arroz salteado al wok al punto ahumado con pollo tierno, cebollita china, huevo y sillao oriental."
  },
  {
    idProducto: "2",
    idCategoria: "1",
    categoria: "Chaufas, tallarines y combinados",
    nombre: "Chaufa de Chancho",
    precio: "15.00",
    disponible: true,
    descripcion: "Arroz chaufa al fuego vivo con panceta asada de cerdo estilo cantonés (char siu) y aromas orientales."
  },
  {
    idProducto: "3",
    idCategoria: "1",
    categoria: "Chaufas, tallarines y combinados",
    nombre: "Tallarín de Pollo",
    precio: "18.00",
    disponible: true,
    descripcion: "Tallarines artesanales salteados al wok con tiernos filetes de pollo y verduras frescas de temporada."
  },
  {
    idProducto: "4",
    idCategoria: "1",
    categoria: "Chaufas, tallarines y combinados",
    nombre: "Tallarín de Chancho",
    precio: "18.00",
    disponible: true,
    descripcion: "Tallarines saltados al fuego intenso con chancho asado cantonés, col china y salsa de soya clásica."
  },
  {
    idProducto: "5",
    idCategoria: "1",
    categoria: "Chaufas, tallarines y combinados",
    nombre: "Combinado de Pollo",
    precio: "20.00",
    disponible: true,
    descripcion: "El dúo legendario chifero: medio chaufa de pollo y medio tallarín saltado con sazón de la casa."
  },
  {
    idProducto: "6",
    idCategoria: "1",
    categoria: "Chaufas, tallarines y combinados",
    nombre: "Aeropuerto de Pollo o Chancho",
    precio: "20.00",
    disponible: true,
    descripcion: "Fusión irresistible de arroz chaufa, tallarines crocantes al wok, frijolito chino y huevo frito."
  },
  {
    idProducto: "7",
    idCategoria: "1",
    categoria: "Chaufas, tallarines y combinados",
    nombre: "Tallarín Taypa",
    precio: "22.00",
    disponible: true,
    descripcion: "Especialidad de la casa con pollo, chancho char siu, langostinos, champiñones y verduras al wok."
  },
  {
    idProducto: "8",
    idCategoria: "2",
    categoria: "Platos de fondo",
    nombre: "Pollo Chijaukay",
    precio: "19.00",
    disponible: true,
    descripcion: "Filetes crocantes de pollo marinados en salsa oscura de canela china, ostión y lluvia de ajonjolí."
  },
  {
    idProducto: "9",
    idCategoria: "2",
    categoria: "Platos de fondo",
    nombre: "Pollo Tipakay",
    precio: "19.00",
    disponible: true,
    descripcion: "Pechuga de pollo crujiente bañada en nuestra emblemática salsa agridulce de tamarindo y semillas de sésamo."
  },
  {
    idProducto: "10",
    idCategoria: "2",
    categoria: "Platos de fondo",
    nombre: "Pollo enrollado con Espárragos",
    precio: "19.00",
    disponible: true,
    descripcion: "Finos rollos dorados de pechuga rellenos de espárragos frescos bañados en salsa especial de la casa."
  },
  {
    idProducto: "11",
    idCategoria: "2",
    categoria: "Platos de fondo",
    nombre: "Taypa",
    precio: "22.00",
    disponible: true,
    descripcion: "Suntuoso salteado imperial cantonés con carnes selectas, langostinos frescos, champiñones y verduras."
  },
  {
    idProducto: "12",
    idCategoria: "2",
    categoria: "Platos de fondo",
    nombre: "Lomo Saltado",
    precio: "19.00",
    disponible: true,
    descripcion: "Trozos de lomo fino flambeados al pisco con cebolla crujiente, tomates jugosos, ají y papas doradas."
  },
  {
    idProducto: "13",
    idCategoria: "2",
    categoria: "Platos de fondo",
    nombre: "Kamlú Wantán",
    precio: "22.00",
    disponible: true,
    descripcion: "Wantanes crocantes recién fritos coronados con salsa agridulce especial, pollo, chancho y piña natural."
  },
  {
    idProducto: "14",
    idCategoria: "2",
    categoria: "Platos de fondo",
    nombre: "Pollo con Piña",
    precio: "20.00",
    disponible: true,
    descripcion: "Tierna pechuga salteada en salsa agridulce balanceada con trozos jugosos de piña golden natural."
  },
  {
    idProducto: "15",
    idCategoria: "2",
    categoria: "Platos de fondo",
    nombre: "Chancho asado al Ajo",
    precio: "22.00",
    disponible: true,
    descripcion: "Finas láminas de panceta laqueada doradas al fuego vivo con ajo aromático crocante y cebolla china."
  },
  {
    idProducto: "16",
    idCategoria: "2",
    categoria: "Platos de fondo",
    nombre: "Chicharrón de Pollo",
    precio: "22.00",
    disponible: true,
    descripcion: "Trozos de pollo extra crujientes por fuera y jugosos por dentro, marinados en cinco especias chinas y limón."
  },
  {
    idProducto: "17",
    idCategoria: "2",
    categoria: "Platos de fondo",
    nombre: "Pollo Limonkay",
    precio: "19.00",
    disponible: true,
    descripcion: "Crocante pechuga empanizada bañada en una refrescante y delicada reducción cítrica de limón oriental."
  },
  {
    idProducto: "18",
    idCategoria: "2",
    categoria: "Platos de fondo",
    nombre: "Mapo Taufú",
    precio: "23.00",
    disponible: true,
    descripcion: "Tradicional receta sichuanesa con dados de tofu suave en salsa aromática con carne molida y pimienta Sichuan."
  }
];

export const MOCK_USERS: User[] = [
  {
    idUsuario: "1",
    nombreUsuario: "admin_fourseas",
    nombreCompleto: "Administrador General",
    rol: "ADMINISTRADOR",
    activo: true
  },
  {
    idUsuario: "2",
    nombreUsuario: "recepcion_tarde",
    nombreCompleto: "Mariana Wong",
    rol: "RECEPCION",
    activo: true
  },
  {
    idUsuario: "3",
    nombreUsuario: "chef_wok",
    nombreCompleto: "Kenji Lau",
    rol: "COCINA",
    activo: true
  },
  {
    idUsuario: "4",
    nombreUsuario: "motorizado_01",
    nombreCompleto: "Pedro Quispe",
    rol: "MOTORIZADO",
    activo: true
  }
];
