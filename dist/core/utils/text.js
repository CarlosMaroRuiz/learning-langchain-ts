/**
 * Normaliza una cadena de texto para comparación flexible:
 * - Remueve diacríticos y acentos (NFD)
 * - Convierte a minúsculas
 * - Remueve signos de puntuación comunes
 * - Colapsa espacios múltiples
 */
export const normalizeText = (text) => text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[¿¡.!?,;:_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
//# sourceMappingURL=text.js.map