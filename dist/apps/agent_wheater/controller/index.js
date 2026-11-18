import axios from "axios";
const GEOCODING_URL = "https://geocoding-api.open-meteo.com/v1/search";
const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const REQUEST_TIMEOUT_MS = 10_000;
/** Quita acentos y normaliza para comparar nombres de ciudad. */
function normalize(value) {
    return value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();
}
/**
 * El geocodificador de Open-Meteo es estricto ("Tuxtla Gutiérrez" no existe en
 * su índice, pero "Tuxtla" sí), así que probamos variantes hasta acertar.
 */
function buildQueryVariants(city) {
    const trimmed = city.replace(/\s+/g, " ").trim();
    const plain = normalize(trimmed);
    const withoutCountry = plain.split(",")[0]?.trim() ?? plain;
    const firstWord = plain.split(/[\s,]+/)[0] ?? plain;
    return [...new Set([trimmed, plain, withoutCountry, firstWord])].filter((query) => query.length > 0);
}
/** Puntúa qué tan bien coincide un resultado con la ciudad buscada (0 a 1). */
function scoreResult(result, city) {
    const tokens = normalize(city)
        .split(/[\s,]+/)
        .filter((token) => token.length > 2);
    if (tokens.length === 0)
        return 0;
    const haystack = normalize([result.name, result.admin2, result.admin1, result.country]
        .filter((part) => typeof part === "string")
        .join(" "));
    const matched = tokens.filter((token) => haystack.includes(token)).length;
    return matched / tokens.length;
}
async function geocode(city) {
    let best;
    for (const query of buildQueryVariants(city)) {
        const { data } = await axios.get(GEOCODING_URL, {
            params: { name: query, count: 5, language: "es", format: "json" },
            timeout: REQUEST_TIMEOUT_MS,
        });
        for (const result of data.results ?? []) {
            const score = scoreResult(result, city);
            if (!best || score > best.score) {
                best = { result, score };
            }
        }
        if (best && best.score >= 0.6)
            break;
    }
    return best?.result;
}
/**
 * Open-Meteo suele devolver nombres abreviados ("Tuxtla Gtz"); si el municipio
 * empieza con ese nombre y es más largo, ese es el nombre completo real.
 */
function displayName(result) {
    const { name, admin2 } = result;
    if (!admin2)
        return name;
    const short = normalize(name);
    const full = normalize(admin2);
    const firstToken = short.split(" ")[0] ?? short;
    const isAbbreviation = full.length > short.length && full.startsWith(firstToken);
    return isAbbreviation ? admin2 : name;
}
export async function getWeather({ city }) {
    try {
        const location = await geocode(city);
        if (!location) {
            return `No se encontraron coordenadas para "${city}". Prueba con el nombre de la ciudad y el país, por ejemplo "Tuxtla, México".`;
        }
        const { latitude, longitude, country } = location;
        const name = displayName(location);
        const { data: weatherData } = await axios.get(FORECAST_URL, {
            params: {
                latitude,
                longitude,
                current: "temperature_2m,relative_humidity_2m,wind_speed_10m",
                timezone: "auto",
            },
            timeout: REQUEST_TIMEOUT_MS,
        });
        const current = weatherData.current;
        if (!current) {
            return `El servicio de clima no devolvió datos actuales para "${name}".`;
        }
        const place = country ? `${name}, ${country}` : name;
        return `En ${place}, la temperatura actual es de ${current.temperature_2m}°C, con una humedad del ${current.relative_humidity_2m}% y viento a ${current.wind_speed_10m} km/h.`;
    }
    catch (error) {
        if (axios.isAxiosError(error)) {
            const reason = error.response?.data?.reason ??
                error.message;
            return `Error al consultar el clima: ${reason}`;
        }
        return `Error al consultar el clima: ${error instanceof Error ? error.message : String(error)}`;
    }
}
//# sourceMappingURL=index.js.map