import { cn } from "@/lib/utils";
import adminLogo from "@/assets/media/logos/logo.png";

interface LogoProps {
  variant?: "light" | "dark";
  collapsed?: boolean;
  className?: string;
}

export function Logo({ variant = "dark", collapsed = false, className }: LogoProps) {
  const isLight = variant === "light";

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "flex h-9 w-9 items-center justify-center rounded-xl shadow-soft transition-all",
          isLight ? "bg-secondary" : "bg-primary"
        )}
      >
        <img
          src={adminLogo}
          alt="Alakowe"
          className="h-5 w-5 object-contain"
        />
      </div>

      {!collapsed && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-display text-base font-bold tracking-tight",
              isLight ? "text-white" : "text-primary"
            )}
          >
            ALÁKÒWÉ
          </span>

          <span
            className={cn(
              "text-[10px] font-medium tracking-wider uppercase",
              isLight ? "text-secondary" : "text-muted-foreground"
            )}
          >
            A new way to read
          </span>
        </div>
      )}
    </div>
  );
}