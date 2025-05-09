import { cn } from "@/lib/utils";

export const Input = ({ className, ...props }) => {
  return (
    <input
      className={cn(
        "flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-[#0A192F] placeholder:text-gray-400 focus:outline-none focus:border-[#0A192F] focus:ring-1 focus:ring-[#0A192F] disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
};
