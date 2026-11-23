import { createContext, useContext, useState } from "react";

interface EnterpriseContextType {
  selectedEnterprise: number | null;
  setSelectedEnterprise: (id: number | null) => void;
}

const EnterpriseContext = createContext<EnterpriseContextType | null>(null);

export const EnterpriseProvider = ({ children }: any) => {
  const [selectedEnterprise, setSelectedEnterpriseState] = useState<number | null>(
    () => {
      const stored = localStorage.getItem("selected_enterprise_id");
      return stored ? Number(stored) : null;
    }
  );

  const setSelectedEnterprise = (id: number | null) => {
    if (id) localStorage.setItem("selected_enterprise_id", id.toString());
    else localStorage.removeItem("selected_enterprise_id");
    setSelectedEnterpriseState(id);
  };

  return (
    <EnterpriseContext.Provider
      value={{ selectedEnterprise, setSelectedEnterprise }}
    >
      {children}
    </EnterpriseContext.Provider>
  );
};

export const useEnterprise = () => {
  const ctx = useContext(EnterpriseContext);
  if (!ctx) throw new Error("useEnterprise must be used inside EnterpriseProvider");
  return ctx;
};
