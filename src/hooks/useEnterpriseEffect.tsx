import { useEffect } from "react";
import { useEnterprise } from "@/context/EnterpriseContext";

export const useEnterpriseEffect = (callback: (id: number) => void) => {
  const { selectedEnterprise } = useEnterprise();

  useEffect(() => {
    if (!selectedEnterprise) return;
    callback(selectedEnterprise);
  }, [selectedEnterprise]);
};
