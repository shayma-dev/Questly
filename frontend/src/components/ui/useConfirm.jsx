import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import ConfirmDialog from "./ConfirmDialog";

// A tiny confirm service so you can: const ok = await confirm({ title, message, danger: true });
const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [pending, setPending] = useState(null); // { options, resolve, reject }

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve, reject) => {
      setPending({ options, resolve, reject });
    });
  }, []);

  const close = useCallback(() => setPending(null), []);

  const ctx = useMemo(() => ({ confirm }), [confirm]);

  const handleCancel = () => {
    pending?.resolve(false);
    close();
  };

  const handleConfirm = () => {
    pending?.resolve(true);
    close();
  };

  return (
    <ConfirmContext.Provider value={ctx}>
      {children}
      <ConfirmDialog
        open={!!pending}
        title={pending?.options?.title}
        message={pending?.options?.message}
        confirmText={pending?.options?.confirmText || "Confirm"}
        cancelText={pending?.options?.cancelText || "Cancel"}
        danger={!!pending?.options?.danger}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
      />
    </ConfirmContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within <ConfirmProvider>");
  }
  return ctx.confirm;
}