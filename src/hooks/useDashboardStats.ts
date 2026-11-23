import { useEffect, useState } from "react";
import api from "@/services/api";

type CountState = { compras: number | null; vendas: number | null; relatorios: number | null };
type Status = "idle" | "loading" | "ready" | "error";

function extractCount(payload: unknown): number {
  if (Array.isArray(payload)) return payload.length;
  if (payload && typeof payload === "object") {
    const data = payload as Record<string, unknown>;
    if (Array.isArray(data.data)) return data.data.length;
    if (Array.isArray(data.results)) return data.results.length;
    if (typeof data.count === "number" && Number.isFinite(data.count)) return data.count;
  }
  throw new Error("Formato inesperado da API");
}

export function useDashboardStats(enterpriseId: number | null, refreshKey = 0) {
  const [counts, setCounts] = useState<CountState>({ compras: null, vendas: null, relatorios: null });
  const [status, setStatus] = useState<Status>("idle");
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    let active = true;
    if (!enterpriseId) {
      setCounts({ compras: null, vendas: null, relatorios: null });
      setStatus("idle");
      setErrors([]);
      return;
    }
    setStatus("loading");
    setErrors([]);
    setCounts({ compras: null, vendas: null, relatorios: null });
    const endpoints = [
      ["compras", `/fetch-buy/${enterpriseId}`],
      ["vendas", `/fetch-sale/${enterpriseId}`],
      ["relatorios", `/fetch-report/${enterpriseId}`],
    ] as const;
    Promise.allSettled(endpoints.map(async ([, url]) => extractCount((await api.get(url)).data)))
      .then((results) => {
        if (!active) return;
        const next: CountState = { compras: null, vendas: null, relatorios: null };
        const failures: string[] = [];
        results.forEach((result, index) => {
          const label = endpoints[index][0];
          if (result.status === "fulfilled") next[label] = result.value;
          else failures.push(label);
        });
        setCounts(next);
        setErrors(failures);
        setStatus(failures.length ? "error" : "ready");
      });
    return () => { active = false; };
  }, [enterpriseId, refreshKey]);
  return { counts, status, errors };
}
