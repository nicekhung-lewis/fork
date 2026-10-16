import { Link } from "@tanstack/react-router";
import { Briefcase } from "lucide-react";

const FOOTER_LINKS = [
  { to: "/", label: "หน้าหลัก" },
  { to: "/jobs/new", label: "โพสต์งาน" },
  { to: "/my-jobs", label: "งานของฉัน" },
  { to: "/my-offers", label: "ข้อเสนอของฉัน" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  return (
    <footer
      data-ocid="footer"
      className="border-t border-border bg-secondary/60"
    >
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:px-8">
        <div className="max-w-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
              <Briefcase className="h-4 w-4" aria-hidden="true" />
            </span>
            <span className="font-display text-lg font-extrabold tracking-tight text-foreground">
              งานดี
            </span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            ตลาดงานครบวงจรสำหรับคนไทย โพสต์งาน ขายบริการ และรับงานได้ในที่เดียว
            พร้อมระบบข้อเสนอ แชท และรีวิวในตัว
          </p>
        </div>

        <nav aria-label="ลิงก์ส่วนท้าย">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {FOOTER_LINKS.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  data-ocid={`footer.link.${link.to === "/" ? "home" : link.to.slice(1).replace(/\//g, "-")}`}
                  className="text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-xs text-muted-foreground">
            © {year}. Built with love using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
