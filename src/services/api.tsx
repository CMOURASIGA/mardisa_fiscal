import axios from "axios";

/**
 * Fiscal ST: somente chamadas GET para a API local, isolada e autenticada.
 * Nunca chamar endpoints fiscais legados: incluem operações que escrevem no banco.
 */
const base = (import.meta.env.VITE_API_URL_LOGIN || import.meta.env.VITE_API_URL || "http://127.0.0.1:8000")
  .replace(/\/$/, "").replace(/\/api\/v1$/, "");
const api = axios.create({ baseURL: base });

api.interceptors.request.use(config => {
  const method = (config.method || "get").toLowerCase();
  const path = (config.url || "").split("?")[0].replace(/\/$/, "");
  let safePath: string | null = null;
  if (method === "get") {
    if (path === "/enterprises" || path === "/enterprises/user") {
      safePath = "/local-data/enterprises/";
    } else if (/^\/enterprises\/\d+$/.test(path)) {
      safePath = `/local-data/enterprises/${path.split("/")[2]}/`;
    } else if (path === "/user" || path === "/userenterprise") {
      safePath = "/local-data/metadata/users/";
    } else if (path === "/databases" || /^\/fetch-db\/\d+$/.test(path)) {
      safePath = "/local-data/metadata/databases/";
    } else {
      const match = path.match(/^\/fetch-(buy|sale|report)\/(\d+)$/);
      if (match) safePath = `/local-data/fiscal/${match[2]}/${match[1]}/`;
    }
  }
  if (!safePath) {
    return Promise.reject(new Error(
      "Esta rotina não está liberada para leitura segura neste ambiente. Operações administrativas e escritas permanecem bloqueadas."
    ));
  }
  const query = config.url?.includes("?") ? "?" + config.url.split("?").slice(1).join("?") : "";
  config.url = safePath + query;
  const token = localStorage.getItem("accessToken");
  if (token) config.headers.set("Authorization", `Bearer ${token}`);
  return config;
});

export default api;
