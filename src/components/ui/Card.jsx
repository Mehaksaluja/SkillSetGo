import { cn } from "@/lib/utils";

export const Card = ({ className, children }) => {
  return (
    <div className={cn("bg-white shadow-md rounded-lg border border-gray-200 p-6 transition-all duration-300 hover:shadow-lg", className)}>
      {children}
    </div>
  );
};
