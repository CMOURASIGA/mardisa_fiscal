import { useEnterprise } from "@/context/EnterpriseContext";
import { unwrapPaginated } from "@/lib/utils";
import api from "@/services/api";
import { useEffect, useState } from "react";

export interface Enterprise {
  id: number;
  razao_social: string;
}

/**
 * Lista de empresas do usuário logado.
 * O backend (`EnterpriseViewSet`) já filtra por papel: staff vê todas,
 * demais veem apenas as próprias — nenhuma regra de role no frontend.
 */
export const useEnterpriseList = () => {
  const [enterprises, setEnterprises] = useState<Enterprise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchEnterprises = async () => {
      try {
        const res = await api.get<unknown>("/enterprises");
        if (active) setEnterprises(unwrapPaginated<Enterprise>(res.data));
      } catch {
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchEnterprises();
    return () => {
      active = false;
    };
  }, []);

  return { enterprises, loading, error };
};

/**
 * Empresa selecionada: id (do contexto), detalhe (`razao_social`) e `select()`.
 * `select()` persiste no contexto/localStorage e todos os consumidores
 * (seletor, upload, generate, tabelas) re-renderizam via contexto.
 */
export const useSelectedEnterprise = () => {
  const { selectedEnterprise, setSelectedEnterprise } = useEnterprise();
  const [enterprise, setEnterprise] = useState<Enterprise | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedEnterprise) {
      setEnterprise(null);
      return;
    }

    let active = true;
    setLoading(true);

    const fetchEnterprise = async () => {
      try {
        const res = await api.get<Enterprise>(`/enterprises/${selectedEnterprise}`);
        if (active) setEnterprise(res.data);
      } catch {
        if (active) setEnterprise(null);
      } finally {
        if (active) setLoading(false);
      }
    };

    fetchEnterprise();
    return () => {
      active = false;
    };
  }, [selectedEnterprise]);

  return {
    enterpriseId: selectedEnterprise,
    enterprise,
    loading,
    select: setSelectedEnterprise,
  };
};
