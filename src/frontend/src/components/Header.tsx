import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useMyProfile } from "@/hooks/use-profile";
import { cn } from "@/lib/utils";
import { Link, useLocation } from "@tanstack/react-router";
import { Briefcase, LogOut, Menu, Plus, User, X } from "lucide-react";
import { useState } from "react";

const NAV_LINKS = [
  { to: "/", label: "หน้าหลัก" },
  { to: "/jobs/new", label: "โพสต์งาน" },
  { to: "/my-jobs", label: "งานของฉัน" },
  { to: "/my-offers", label: "ข้อเสนอของฉัน" },
] as const;

function initials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "?";
  return trimmed.slice(0, 2).toUpperCase();
}

export function Header() {
  const { isAuthenticated, isInitializing, login, logout, principal } =
    useAuth();
  const { data: profile } = useMyProfile();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const displayName = profile?.displayName?.trim() || "ผู้ใช้ใหม่";

  return (
    <header
      data-ocid="header"
      className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-subtle"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          to="/"
          data-ocid="header.logo_link"
          className="flex shrink-0 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
            <Briefcase className="h-5 w-5" aria-hidden="true" />
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight text-foreground">
            งานดี
          </span>
        </Link>

        <nav
          aria-label="เมนูหลัก"
          className="ml-4 hidden items-center gap-1 md:flex"
        >
          {NAV_LINKS.map((link) => {
            const active =
              link.to === "/"
                ? location.pathname === "/"
                : location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                data-ocid={`header.nav.${link.to === "/" ? "home" : link.to.slice(1).replace(/\//g, "-")}`}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button
            asChild
            data-ocid="header.post_job_button"
            className="hidden rounded-full bg-accent text-accent-foreground hover:bg-accent/90 sm:inline-flex"
          >
            <Link to="/jobs/new">
              <Plus className="h-4 w-4" aria-hidden="true" />
              โพสต์งาน
            </Link>
          </Button>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  data-ocid="header.account_menu_button"
                  aria-label="เมนูบัญชี"
                  className="flex items-center gap-2 rounded-full border border-border bg-card p-1 pr-3 transition-smooth hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                      {initials(displayName)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-[8rem] truncate text-sm font-medium text-foreground sm:block">
                    {displayName}
                  </span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="truncate">
                  {displayName}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile" data-ocid="header.profile_link">
                    <User className="h-4 w-4" aria-hidden="true" />
                    โปรไฟล์ของฉัน
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/my-jobs" data-ocid="header.my_jobs_link">
                    <Briefcase className="h-4 w-4" aria-hidden="true" />
                    งานของฉัน
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  data-ocid="header.sign_out_button"
                  onSelect={() => logout()}
                >
                  <LogOut className="h-4 w-4" aria-hidden="true" />
                  ออกจากระบบ
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              type="button"
              variant="outline"
              data-ocid="header.sign_in_button"
              disabled={isInitializing}
              onClick={() => login()}
              className="rounded-full"
            >
              {isInitializing ? "กำลังโหลด…" : "เข้าสู่ระบบ"}
            </Button>
          )}

          <button
            type="button"
            data-ocid="header.mobile_menu_button"
            aria-label={mobileOpen ? "ปิดเมนู" : "เปิดเมนู"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground transition-smooth hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
          >
            {mobileOpen ? (
              <X className="h-5 w-5" aria-hidden="true" />
            ) : (
              <Menu className="h-5 w-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav
          aria-label="เมนูหลักบนมือถือ"
          data-ocid="header.mobile_menu"
          className="border-t border-border bg-card px-4 py-3 md:hidden"
        >
          <ul className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  data-ocid={`header.mobile_nav.${link.to === "/" ? "home" : link.to.slice(1).replace(/\//g, "-")}`}
                  className="block rounded-md px-3 py-2 text-sm font-medium text-foreground transition-smooth hover:bg-secondary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            {isAuthenticated && principal && (
              <li>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  data-ocid="header.mobile_profile_link"
                  className="block rounded-md px-3 py-2 text-sm font-medium text-foreground transition-smooth hover:bg-secondary"
                >
                  โปรไฟล์ของฉัน
                </Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </header>
  );
}
