import { createContext, useContext, useState } from "react";
import { X } from "lucide-react";

const ToasterContext = createContext();

export function ToasterProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3000);
  };

  return (
    <ToasterContext.Provider value={{ addToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`mb-2 p-4 rounded-lg shadow-lg ${
              toast.type === "success"
                ? "bg-green-500"
                : toast.type === "error"
                ? "bg-red-500"
                : "bg-blue-500"
            } text-white`}
          >
            {toast.message}
          </div>
        ))}
      </div>
    </ToasterContext.Provider>
  );
}

export function useToaster() {
  const context = useContext(ToasterContext);
  if (!context) {
    throw new Error("useToaster must be used within a ToasterProvider");
  }
  return context;
}

export function Toaster() {
  return null; // This is just a placeholder for the toast container
} 