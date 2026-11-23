import axios from "axios";

/**
 * Fiscal ST - modo consulta.
 * A camada de UI não pode chamar operações que escrevam no banco oficial.
 * IMPORTANTE: proteção de frontend não substitui autorização/usuário read-only no backend.
 */
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL });

const READ_ENDPOINTS = [
  /^\/fetch-(buy|sale|report|db|code|user)(\/\d+)?\/?$/,
  /^\/enterprises(\/\d+)?\/?$/,
  /^\/enterprises\/user\/?$/,
  /^\/user(\/\d+)?\/?$/,
  /^\/userenterprise(\/\d+)?\/?$/,
  /^\/groups(\/\d+)?\/?$/,
  /^\/databases(\/\d+)?\/?$/,
];

api.interceptors.request.use((config) => {
  const method = (config.method || "get").toLowerCase();
  const pathname = (config.url || "").split("?")[0];
  if (method !== "get" || !READ_ENDPOINTS.some((pattern) => pattern.test(pathname))) {
    return Promise.reject(new Error("Operação indisponível nesta demonstração. Apenas consultas autorizadas ao backend são permitidas; importações são locais."));
  }
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});
export default api;
