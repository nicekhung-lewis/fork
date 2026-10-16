import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { Toaster } from "@/components/ui/sonner";

/**
 * App shell: sticky header, main content region, footer, and the toast host.
 * Pages render inside the `main` element via the router outlet.
 */
export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main data-ocid="page" className="flex-1 bg-background">
        {children}
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}
