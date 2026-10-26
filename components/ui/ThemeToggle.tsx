"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className={`h-9 w-9 text-muted-foreground ${className || ""}`}
        aria-label="Toggle visual theme"
        disabled
      >
        <Moon className="h-4 w-4" />
      </Button>
    );
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors ${className || ""}`}
      title={isDark ? "Switch to light aesthetic" : "Switch to dark studio aesthetic"}
      aria-label="Toggle visual theme"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-warning transition-transform rotate-0 scale-100" />
      ) : (
        <Moon className="h-4 w-4 text-foreground transition-transform rotate-0 scale-100" />
      )}
    </Button>
  );
}
