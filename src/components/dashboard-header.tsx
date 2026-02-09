"use client";

import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { signOut } from "next-auth/react";
import { HelpCircle, Settings, Moon, Sun, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShortcutTooltip } from "@/components/ui/shortcut-tooltip";

interface DashboardHeaderProps {
  userName?: string | null;
  userEmail?: string | null;
}

const PAGE_TITLES: Record<string, { title: string; description?: string }> = {
  "/dashboard/chat": { title: "Chat", description: "Ask about your coverage" },
  "/dashboard/documents": { title: "My Documents", description: "Your uploaded insurance documents" },
  "/dashboard/providers": { title: "Find Providers", description: "Nearby healthcare providers" },
  "/dashboard/settings": { title: "Settings", description: "Manage your account" },
  "/dashboard": { title: "Home", description: "Your benefits at a glance" },
};

function getPageInfo(pathname: string) {
  // Check for exact matches first, then prefix matches
  for (const [path, info] of Object.entries(PAGE_TITLES)) {
    if (pathname.startsWith(path)) return info;
  }
  return { title: "Dashboard" };
}

function getInitials(name?: string | null, email?: string | null): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  }
  if (email) return email[0].toUpperCase();
  return "U";
}

export function DashboardHeader({ userName, userEmail }: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const pageInfo = getPageInfo(pathname);
  const initials = getInitials(userName, userEmail);

  const handleShowShortcuts = () => {
    window.dispatchEvent(new CustomEvent("bg:show-shortcuts"));
  };

  return (
    <header className="h-14 border-b bg-muted/40 backdrop-blur-sm flex items-center justify-between px-6 flex-shrink-0">
      {/* Left: Page context */}
      <div className="flex items-center gap-3">
        <h1 className="text-sm font-semibold text-foreground">{pageInfo.title}</h1>
        {pageInfo.description && (
          <>
            <span className="text-muted-foreground/40">·</span>
            <span className="text-xs text-muted-foreground hidden sm:block">{pageInfo.description}</span>
          </>
        )}
      </div>

      {/* Right: Actions + user */}
      <div className="flex items-center gap-2">
        <ShortcutTooltip shortcutId="show-shortcuts" side="bottom">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
            onClick={handleShowShortcuts}
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        </ShortcutTooltip>

        {/* User profile dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-full hover:bg-muted transition-colors cursor-pointer outline-none">
              <span className="text-xs text-muted-foreground hidden sm:block">
                {userName || userEmail}
              </span>
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 ring-1 ring-primary/20">
                <span className="text-xs font-semibold text-primary">{initials}</span>
              </div>
              <ChevronDown className="w-3 h-3 text-muted-foreground hidden sm:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                {userName && <p className="text-sm font-medium leading-none">{userName}</p>}
                {userEmail && (
                  <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                <Settings className="w-4 h-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
                {theme === "dark" ? "Light Mode" : "Dark Mode"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleShowShortcuts}>
                <HelpCircle className="w-4 h-4" />
                Keyboard Shortcuts
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
