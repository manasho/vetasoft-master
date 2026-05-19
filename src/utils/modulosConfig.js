/**
 * Mapeo entre las rutas de la BD (tabla modulos) y las secciones del frontend.
 * 
 * Cada key es la ruta exacta tal cual está guardada en la columna `ruta`
 * de la tabla `modulos` en PostgreSQL.
 * 
 * Se usa para:
 *  1. Convertir la ruta de la BD al ID de sección que entiende App.js
 *  2. Asignar un emoji como ícono (el frontend usa emojis, no Lucide icons)
 */

const MODULO_MAP = {
  "/dashboard":            { sectionId: "dashboard",    emoji: "📊", label: null },
  "/clientes":             { sectionId: "clientes",     emoji: "👤", label: null },
  "/animales":             { sectionId: "pets",         emoji: "🐕", label: null },
  "/citas":                { sectionId: "appointments", emoji: "📅", label: null },
  "/veterinarios":         { sectionId: "veterinarios", emoji: "🩺", label: null },
  "/historial-medico":     { sectionId: "medical",      emoji: "📋", label: null },
  "/historial-vacunacion": { sectionId: "vacunacion",   emoji: "💉", label: null },
  "/campanas":             { sectionId: "campanas",     emoji: "📢", label: null },
  "/donaciones":           { sectionId: "Donaciones",   emoji: "💰", label: null },
  "/solicitudes-adopcion": { sectionId: "adoptions",    emoji: "❤️", label: null },
  //"/usuarios":           { sectionId: "usuarios",     emoji: "👥", label: null },
  "/reportes":             { sectionId: "reportes",     emoji: "📈", label: "Reportes" },
};

/**
 * Transforma la respuesta de GET /api/modulos/mis-modulos
 * al formato que necesita el Header del frontend.
 *
 * @param {Array} modulosApi  - Array de módulos que devuelve la API
 * @returns {Array} - Array de objetos { sectionId, label, emoji, ruta }
 */
export function mapModulosToNav(modulosApi) {
  if (!Array.isArray(modulosApi)) return [];

  return modulosApi
    .map((mod) => {
      const config = MODULO_MAP[mod.ruta];
      if (!config) {
        console.warn(`⚠️ Módulo sin mapeo en el frontend: "${mod.nombre}" (ruta: ${mod.ruta})`);
        return null;
      }
      return {
        sectionId: config.sectionId,
        label: config.label || mod.nombre,   // Usa el nombre de la BD
        emoji: config.emoji,
        ruta: mod.ruta,
      };
    })
    .filter(Boolean); // Eliminar módulos sin mapeo
}

export default MODULO_MAP;
