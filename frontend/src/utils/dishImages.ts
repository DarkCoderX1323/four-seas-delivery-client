/**
 * Mapeo oficial y resolución inteligente de imágenes de platos
 * Four Seas International House S.A.C.
 */

// Diccionario canónico de slugs de platos para nombres de archivos limpios
export const DISH_SLUG_MAP: Record<string, string> = {
  // Chaufas, tallarines y combinados
  "chaufa de pollo": "chaufa-pollo",
  "chaufa de chancho": "chaufa-chancho",
  "tallarín de pollo": "tallarin-pollo",
  "tallarin de pollo": "tallarin-pollo",
  "tallarín de chancho": "tallarin-chancho",
  "tallarin de chancho": "tallarin-chancho",
  "combinado de pollo": "combinado-pollo",
  "aeropuerto de pollo o chancho": "aeropuerto-pollo",
  "aeropuerto": "aeropuerto-pollo",
  "tallarín taypa": "tallarin-taypa",
  "tallarin taypa": "tallarin-taypa",

  // Platos de fondo
  "pollo chijaukay": "pollo-chijaukay",
  "pollo tipakay": "pollo-tipakay",
  "pollo enrollado con espárragos": "pollo-enrollado-esparragos",
  "pollo enrollado con esparragos": "pollo-enrollado-esparragos",
  "taypa": "taypa",
  "lomo saltado": "lomo-saltado",
  "pollo con verdura": "pollo-verdura",
  "pollo con fansi": "pollo-fansi",
  "kamlú wantán": "kam-lu-wantan",
  "kamlu wantan": "kam-lu-wantan",
  "kam lu wantan": "kam-lu-wantan",
  "pollo con tausi": "pollo-tausi",
  "pollo con piña": "pollo-con-pina",
  "tortilla con pollo y verdura": "tortilla-pollo",
  "chancho asado al ajo": "chancho-asado-ajo",
  "pollo con frejolito": "pollo-frejolito",
  "langostinos con verdura": "langostinos-verdura",
  "chancho asado con tamarindo": "chancho-tamarindo",
  "carne de res con verdura": "carne-res-verdura",
  "pescado con tausi": "pescado-tausi",
  "chicharrón de pollo": "chicharron-pollo",
  "chicharron de pollo": "chicharron-pollo",
  "pollo limonkay": "pollo-limonkay",
  "guiso de gaunam": "guiso-gaunam",
  "vainita con chancho molido": "vainita-chancho",
  "balsamina con carne": "balsamina-carne",
  "mapo taufú": "mapo-taufu",
  "mapo taufu": "mapo-taufu",

  // Entradas y sopas
  "sopa wantán": "sopa-wantan",
  "sopa wantan": "sopa-wantan",
  "sopa fansi": "sopa-fansi",
  "wantán frito": "wantan-frito",
  "wantan frito": "wantan-frito"
};

/**
 * Obtiene el slug de archivo para un plato a partir de su nombre
 */
export const getDishSlug = (nombre: string): string => {
  const clean = nombre.trim().toLowerCase();
  if (DISH_SLUG_MAP[clean]) {
    return DISH_SLUG_MAP[clean];
  }

  // Fallback slug automático quitando tildes y caracteres especiales
  return clean
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Retorna la lista de rutas candidatas para probar en orden de prioridad:
 * .webp -> .jpg -> .png -> .jpeg
 */
export const getCandidateImageUrls = (nombre: string, customImage?: string): string[] => {
  if (customImage && customImage.trim() !== "") {
    return [customImage];
  }

  const slug = getDishSlug(nombre);
  const basePath = "/images/dishes";

  return [
    `${basePath}/${slug}.webp`,
    `${basePath}/${slug}.jpg`,
    `${basePath}/${slug}.png`,
    `${basePath}/${slug}.jpeg`
  ];
};

/**
 * Emoji representativo en caso de que aún no exista foto
 */
export const getDishEmoji = (name: string): string => {
  const lower = name.toLowerCase();
  if (lower.includes("chaufa")) return "🍚";
  if (lower.includes("tallarín") || lower.includes("tallarin") || lower.includes("fansi")) return "🍜";
  if (lower.includes("aeropuerto") || lower.includes("combinado")) return "🍱";
  if (lower.includes("wantán") || lower.includes("wantan")) return "🥟";
  if (lower.includes("langostino") || lower.includes("pescado")) return "🍤";
  if (lower.includes("chancho")) return "🥩";
  if (lower.includes("lomo")) return "🥘";
  if (lower.includes("tortilla")) return "🍳";
  if (lower.includes("sopa")) return "🍲";
  return "🍗";
};
