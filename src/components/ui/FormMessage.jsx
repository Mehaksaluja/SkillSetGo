export const FormMessage = ({ message, type = "error" }) => {
  if (!message) return null;
  
  const styles = {
    error: "text-[#000080]",
    success: "text-[#0A192F]",
    info: "text-blue-600",
  };

  return (
    <p className={`text-sm ${styles[type]} mt-1.5 flex items-center space-x-1`}>
      {type === "error" && (
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )}
      <span>{message}</span>
    </p>
  );
};
