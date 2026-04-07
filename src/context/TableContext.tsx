import React, { createContext, useContext } from "react";
import { useSearchParams } from "react-router-dom";

interface TableContextType {
  tableNumber: number | null;
}

const TableContext = createContext<TableContextType>({ tableNumber: null });

export const TableProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get("table");
  const tableNumber = tableParam ? parseInt(tableParam, 10) : null;

  return (
    <TableContext.Provider value={{ tableNumber: Number.isNaN(tableNumber) ? null : tableNumber }}>
      {children}
    </TableContext.Provider>
  );
};

export const useTable = () => useContext(TableContext);
