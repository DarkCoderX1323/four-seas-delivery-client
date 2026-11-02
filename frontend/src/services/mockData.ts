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
    disponible: true
  },
  {
    idProducto: "2",
    idCategoria: "1",
    categoria: "Chaufas, tallarines y combinados",
    nombre: "Chaufa de Chancho",
    precio: "15.00",
    disponible: true
  },
  {
    idProducto: "3",
    idCategoria: "1",
    categoria: "Chaufas, tallarines y combinados",
    nombre: "Tallarín de Pollo",
    precio: "18.00",
    disponible: true
  },
  {
    idProducto: "4",
    idCategoria: "1",
    categoria: "Chaufas, tallarines y combinados",
    nombre: "Tallarín de Chancho",
    precio: "18.00",
    disponible: true
  },
  {
    idProducto: "5",
    idCategoria: "1",
    categoria: "Chaufas, tallarines y combinados",
    nombre: "Combinado de Pollo",
    precio: "20.00",
    disponible: true
  },
  {
    idProducto: "6",
    idCategoria: "1",
    categoria: "Chaufas, tallarines y combinados",
    nombre: "Aeropuerto de Pollo o Chancho",
    precio: "20.00",
    disponible: true
  },
  {
    idProducto: "7",
    idCategoria: "1",
    categoria: "Chaufas, tallarines y combinados",
    nombre: "Tallarín Taypa",
    precio: "22.00",
    disponible: true
  },
  {
    idProducto: "8",
    idCategoria: "2",
    categoria: "Platos de fondo",
    nombre: "Pollo Chijaukay",
    precio: "19.00",
    disponible: true
  },
  {
    idProducto: "9",
    idCategoria: "2",
    categoria: "Platos de fondo",
    nombre: "Pollo Tipakay",
    precio: "19.00",
    disponible: true
  },
  {
    idProducto: "10",
    idCategoria: "2",
    categoria: "Platos de fondo",
    nombre: "Pollo enrollado con Espárragos",
    precio: "19.00",
    disponible: true
  },
  {
    idProducto: "11",
    idCategoria: "2",
    categoria: "Platos de fondo",
    nombre: "Taypa",
    precio: "22.00",
    disponible: true
  },
  {
    idProducto: "12",
    idCategoria: "2",
    categoria: "Platos de fondo",
    nombre: "Lomo Saltado",
    precio: "19.00",
    disponible: true
  },
  {
    idProducto: "13",
    idCategoria: "2",
    categoria: "Platos de fondo",
    nombre: "Kamlú Wantán",
    precio: "22.00",
    disponible: true
  },
  {
    idProducto: "14",
    idCategoria: "2",
    categoria: "Platos de fondo",
    nombre: "Pollo con Piña",
    precio: "20.00",
    disponible: true
  },
  {
    idProducto: "15",
    idCategoria: "2",
    categoria: "Platos de fondo",
    nombre: "Chancho asado al Ajo",
    precio: "22.00",
    disponible: true
  },
  {
    idProducto: "16",
    idCategoria: "2",
    categoria: "Platos de fondo",
    nombre: "Chicharrón de Pollo",
    precio: "22.00",
    disponible: true
  },
  {
    idProducto: "17",
    idCategoria: "2",
    categoria: "Platos de fondo",
    nombre: "Pollo Limonkay",
    precio: "19.00",
    disponible: true
  },
  {
    idProducto: "18",
    idCategoria: "2",
    categoria: "Platos de fondo",
    nombre: "Mapo Taufú",
    precio: "23.00",
    disponible: true
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
