export default function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-xl font-semibold tracking-tight transition-all disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-filup-primary";

  const sizes = {
    sm: "px-3 py-2 text-xs",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3.5 text-base",
  };

  const variants = {
    primary: "btn-gradient text-white",
    secondary:
      "bg-filup-surface-2/80 text-filup-text border border-filup-border hover:border-filup-primary/60 hover:bg-filup-surface-2",
    outline:
      "border border-filup-primary/50 text-filup-primary hover:bg-filup-primary/10",
    ghost: "text-filup-muted hover:text-filup-text hover:bg-filup-surface-2/60",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
