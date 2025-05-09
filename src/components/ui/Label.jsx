import { cn } from "@/lib/utils";

export const Label = ({ className, required, ...props }) => {
  return (
    <label
      className={cn(
        "text-sm font-medium text-[#000080] flex items-center space-x-1",
        className
      )}
      {...props}
    >
      <span>{props.children}</span>
      {required && <span className="text-red-500">*</span>}
    </label>
  );
};
